# Tests d'intégration API — tous les endpoints boucherieV1 + auth.
# Usage (depuis scripts/) :
#   Get-Content .env.test | ForEach-Object { if ($_ -match '^\s*([^#][^=]+)=(.*)$') { Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim() } }
#   .\test-api-integration.ps1

$ErrorActionPreference = "Continue"

$script:Passed = 0
$script:Failed = 0
$script:Skipped = 0

function Get-ApiBase {
  $origin = if ($env:API_BASE_URL) { $env:API_BASE_URL.TrimEnd("/") } else { "https://boucherie-api.onrender.com" }
  $prefix = if ($env:API_PREFIX) { $env:API_PREFIX.Trim() } else { "/api/v1" }
  if (-not $prefix.StartsWith("/")) { $prefix = "/$prefix" }
  return "$origin$($prefix.TrimEnd('/'))"
}

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

function Write-Ok($msg) {
  Write-Host "  OK   $msg" -ForegroundColor Green
  $script:Passed++
}
function Write-Skip($msg) {
  Write-Host "  SKIP $msg" -ForegroundColor DarkYellow
  $script:Skipped++
}
function Write-Fail($msg, $code, $body) {
  Write-Host "  FAIL $msg (HTTP $code)" -ForegroundColor Red
  if ($body -and $body.Length -lt 500) { Write-Host "       $body" }
  elseif ($body) { Write-Host "       $($body.Substring(0, [Math]::Min(400, $body.Length)))..." }
  $script:Failed++
}

function Invoke-Api {
  param(
    [string]$Method = "GET",
    [string]$Path,
    [hashtable]$Headers = @{},
    [object]$Body,
    [int[]]$ExpectStatus = @(200)
  )
  $uri = "$(Get-ApiBase)$Path"
  $params = @{
    Uri         = $uri
    Method      = $Method
    Headers     = $Headers
    ErrorAction = "Stop"
  }
  if ($null -ne $Body) {
    $params.ContentType = "application/json"
    $params.Body = ($Body | ConvertTo-Json -Depth 12 -Compress)
  }
  try {
    $r = Invoke-RestMethod @params
    return @{ ok = $true; data = $r; code = 200 }
  } catch {
    $code = 0
    $text = $_.Exception.Message
    if ($_.Exception.Response) {
      $code = [int]$_.Exception.Response.StatusCode
      try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $text = $reader.ReadToEnd()
        $reader.Close()
      } catch {}
    }
    if ($ExpectStatus -contains $code) {
      return @{ ok = $true; data = $null; code = $code; body = $text; expected = $true }
    }
    return @{ ok = $false; code = $code; body = $text }
  }
}

function Get-UnwrappedData($response) {
  if ($null -eq $response) { return $null }
  if ($response.data -is [array]) { return $response.data }
  if ($response.data -and $response.data.data -is [array]) { return $response.data.data }
  if ($response -is [array]) { return $response }
  if ($response.data) { return $response.data }
  return $response
}

function Get-ArrayCount($data) {
  if ($null -eq $data) { return "?" }
  if ($data -is [array]) { return $data.Count }
  return 1
}

function Test-Endpoint {
  param(
    [Parameter(Mandatory)][string]$Label,
    [Parameter(Mandatory)][hashtable]$Headers,
    [Parameter(Mandatory)][string]$Path,
    [string]$Method = "GET",
    [object]$Body,
    [int[]]$ExpectStatus = @(200),
    [switch]$AllowSkip
  )
  if ($AllowSkip -and (-not $Headers -or -not $Headers.Authorization)) {
    Write-Skip "$Label (pas de token)"
    return $null
  }
  $r = Invoke-Api -Method $Method -Path $Path -Headers $Headers -Body $Body -ExpectStatus $ExpectStatus
  $okCodes = ($ExpectStatus | ForEach-Object { "$_" }) -join ","
  if ($r.ok) {
    $extra = ""
    if ($Method -eq "GET" -and $r.data) {
      $d = Get-UnwrappedData $r.data
      $extra = " n=$(Get-ArrayCount $d)"
    }
    if ($r.expected) { $extra += " (attendu HTTP $($r.code))" }
    Write-Ok "$Label$extra"
    return $r.data
  }
  Write-Fail "$Label" $r.code $r.body
  return $null
}

function Get-AuthToken($email, $password, $roleLabel) {
  if (-not $email -or -not $password) {
    Write-Skip "login $roleLabel (identifiants absents)"
    return $null
  }
  $r = Invoke-Api -Method POST -Path "/auth/login" -Body @{ email = $email; password = $password } -ExpectStatus @(200)
  if (-not $r.ok) {
    Write-Fail "POST /auth/login ($roleLabel)" $r.code $r.body
    return $null
  }
  $token = $r.data.token
  if (-not $token) { Write-Fail "POST /auth/login ($roleLabel)" 200 "token manquant"; return $null }
  Write-Ok "POST /auth/login ($roleLabel)"
  return $token
}

function New-AuthHeaders($token) {
  return @{ Authorization = "Bearer $token"; Accept = "application/json" }
}

function Get-FirstId($listResponse) {
  $d = Get-UnwrappedData $listResponse
  if ($null -eq $d) { return $null }
  if ($d -is [array] -and $d.Count -gt 0) { return $d[0].id }
  if ($d.id) { return $d.id }
  return $null
}

function Test-AuthRoutes($token, $roleLabel) {
  Write-Step "AUTH ($roleLabel)"
  $h = New-AuthHeaders $token
  [void](Test-Endpoint -Label "GET /auth/me" -Headers $h -Path "/auth/me")
}

function Test-Referentiels($h, $types) {
  Write-Step "REFERENTIELS"
  foreach ($t in $types) {
    [void](Test-Endpoint -Label "GET /referentiels/$t" -Headers $h -Path "/referentiels/$t")
  }
}

function Test-AdminEndpoints($h) {
  Write-Step "ADMIN - lecture"
  $paths = @(
    "/users", "/fournisseurs", "/boucheries", "/clients", "/produits",
    "/achats-fournisseurs", "/animaux", "/abattages", "/stocks", "/ventes",
    "/versements", "/distributions", "/receptions"
  )
  foreach ($p in $paths) {
    [void](Test-Endpoint -Label "GET $p" -Headers $h -Path $p)
  }

  $pairs = @(
    @{ list = "/users"; detail = "users" },
    @{ list = "/boucheries"; detail = "boucheries" },
    @{ list = "/produits"; detail = "produits" },
    @{ list = "/fournisseurs"; detail = "fournisseurs" },
    @{ list = "/clients"; detail = "clients" },
    @{ list = "/achats-fournisseurs"; detail = "achats-fournisseurs" },
    @{ list = "/animaux"; detail = "animaux" },
    @{ list = "/abattages"; detail = "abattages" },
    @{ list = "/stocks"; detail = "stocks" },
    @{ list = "/ventes"; detail = "ventes" },
    @{ list = "/versements"; detail = "versements" },
    @{ list = "/distributions"; detail = "distributions" },
    @{ list = "/receptions"; detail = "receptions" }
  )
  foreach ($pair in $pairs) {
    $lr = Invoke-Api -Headers $h -Path $pair.list
    $id = if ($lr.ok) { Get-FirstId $lr.data } else { $null }
    if ($id) {
      [void](Test-Endpoint -Label "GET /$($pair.detail)/{id}" -Headers $h -Path "/$($pair.detail)/$id")
    }
  }
}

function Test-SupplierEndpoints($h) {
  Write-Step "FOURNISSEUR - lecture"
  Test-Endpoint "GET /achats-fournisseurs" $h "/achats-fournisseurs"
  Test-Endpoint "GET /animaux?statut=en_attente" $h "/animaux?statut=en_attente"
  Test-Endpoint "GET /abattages" $h "/abattages"
  Test-Endpoint "GET /versements" $h "/versements"
  Test-Endpoint "GET /distributions" $h "/distributions"
  Test-Endpoint "GET /boucheries" $h "/boucheries"
  Test-Endpoint "GET /produits" $h "/produits"
  Test-Endpoint "GET /referentiels/categorie_produit" $h "/referentiels/categorie_produit"
  Test-Endpoint "GET /referentiels/espece_animal" $h "/referentiels/espece_animal"

  Write-Step "FOURNISSEUR - interdits HTTP 403"
  Test-Endpoint "GET /ventes (403)" $h "/ventes" -ExpectStatus @(403)
  Test-Endpoint "GET /stocks (403)" $h "/stocks" -ExpectStatus @(403)

  Write-Step "FOURNISSEUR - ecriture smoke"
  $tag = "TAG-INT-$(Get-Date -Format 'yyyyMMddHHmmss')"
  Test-Endpoint -Label "POST /achats-fournisseurs" -Headers $h -Method POST -Path "/achats-fournisseurs" -Body @{
    date_achat    = (Get-Date -Format "yyyy-MM-dd")
    montant_total = 1000
    animaux       = @(@{
        espece       = "bovin"
        poids_vif_kg = 50
        prix_achat   = 1000
        numero_tag   = $tag
      })
  } -ExpectStatus @(200, 201, 422)

  $animalId = $null
  $anim = Invoke-Api -Headers $h -Path "/animaux?statut=en_attente"
  if ($anim.ok) {
    $arr = Get-UnwrappedData $anim.data
    if ($arr -is [array] -and $arr.Count -gt 0) { $animalId = $arr[0].id }
  }
  if ($animalId) {
    Test-Endpoint "GET /animaux/{id}" $h "/animaux/$animalId"
  } else {
    Write-Skip "GET /animaux/{id} (aucun animal en attente)"
  }

  $produitsByCat = @{}
  $pr = Invoke-Api -Headers $h -Path "/produits"
  if ($pr.ok) {
    foreach ($p in (Get-UnwrappedData $pr.data)) {
      $cat = $p.categorie
      if (-not $cat) { $cat = $p.categorie_produit }
      if ($cat -is [string] -and -not $produitsByCat.ContainsKey($cat)) {
        $produitsByCat[$cat] = $p.id
      } elseif ($cat -and $cat.valeur -and -not $produitsByCat.ContainsKey($cat.valeur)) {
        $produitsByCat[$cat.valeur] = $p.id
      }
    }
  }

  $cats = Invoke-Api -Headers $h -Path "/referentiels/categorie_produit"
  $catCodes = @()
  if ($cats.ok) {
    foreach ($c in (Get-UnwrappedData $cats.data)) {
      if ($c.valeur) { $catCodes += $c.valeur }
    }
  }
  if (-not $catCodes.Count) { $catCodes = @("viande_rouge") }

  $stocks = @()
  $catUsed = $catCodes[0]
  $produitId = $produitsByCat[$catUsed]
  if (-not $produitId -and $pr.ok) {
    $all = Get-UnwrappedData $pr.data
    if ($all -is [array] -and $all.Count -gt 0) { $produitId = $all[0].id }
  }

  if ($animalId -and $produitId) {
    $stocks = @(@{ produit_id = $produitId; quantite = 10 })
    $abr = Invoke-Api -Method POST -Path "/abattages" -Headers $h -Body @{
      animal_id         = $animalId
      date_abattage     = (Get-Date -Format "yyyy-MM-dd")
      poids_carcasse_kg = 10
      stocks            = $stocks
    } -ExpectStatus @(200, 201)
    if ($abr.ok) {
      $abData = Get-UnwrappedData $abr.data
      $abId = $abData.id
      Write-Ok "POST /abattages (id=$abId)"
      if ($abId) {
        Test-Endpoint "GET /abattages/{id}" $h "/abattages/$abId"
        $boucheries = Invoke-Api -Headers $h -Path "/boucheries"
        $bId = $null
        if ($boucheries.ok) { $bId = Get-FirstId $boucheries.data }
        if ($bId) {
          Test-Endpoint -Label "POST /distributions" -Headers $h -Method POST -Path "/distributions" -Body @{
            abattage_id  = $abId
            boucherie_id = $bId
            produit_id   = $produitId
            quantite     = 5
          } -ExpectStatus @(200, 201, 422)
        } else {
          Write-Skip "POST /distributions (aucune boucherie)"
        }
      }
    } else {
      Write-Fail "POST /abattages" $abr.code $abr.body
    }
  } else {
    Write-Skip "POST /abattages (animal ou produit manquant)"
  }

  $abList = Invoke-Api -Headers $h -Path "/abattages"
  if ($abList.ok) {
    $aid = Get-FirstId $abList.data
    if ($aid) { Test-Endpoint "GET /abattages/{id}" $h "/abattages/$aid" }
  }
  $distList = Invoke-Api -Headers $h -Path "/distributions"
  if ($distList.ok) {
    $did = Get-FirstId $distList.data
    if ($did) { Test-Endpoint "GET /distributions/{id}" $h "/distributions/$did" }
  }
}

function Test-ButcherEndpoints($h) {
  Write-Step "BOUCHER - lecture"
  Test-Endpoint "GET /stocks" $h "/stocks"
  Test-Endpoint "GET /ventes" $h "/ventes"
  Test-Endpoint "GET /versements" $h "/versements"
  Test-Endpoint "GET /receptions" $h "/receptions"
  Test-Endpoint "GET /distributions" $h "/distributions"
  Test-Endpoint "GET /clients" $h "/clients"
  Test-Endpoint "GET /produits" $h "/produits"

  Write-Step "BOUCHER - interdits fournisseur HTTP 403"
  Test-Endpoint "GET /abattages (403)" $h "/abattages" -ExpectStatus @(403)
  Test-Endpoint "GET /achats-fournisseurs (403)" $h "/achats-fournisseurs" -ExpectStatus @(403)

  $stocks = Invoke-Api -Headers $h -Path "/stocks"
  if ($stocks.ok) {
    $sid = Get-FirstId $stocks.data
    if ($sid) {
      Test-Endpoint "GET /stocks/{id}" $h "/stocks/$sid"
      Test-Endpoint "GET /stocks/{id}/mouvements" $h "/stocks/$sid/mouvements"
    }
  }

  $ventes = Invoke-Api -Headers $h -Path "/ventes"
  if ($ventes.ok) {
    $vid = Get-FirstId $ventes.data
    if ($vid) {
      Test-Endpoint "GET /ventes/{id}" $h "/ventes/$vid"
      Test-Endpoint "GET /ventes/{id}/paiements" $h "/ventes/$vid/paiements"
    }
  }

  $rec = Invoke-Api -Headers $h -Path "/receptions"
  if ($rec.ok) {
    $rid = Get-FirstId $rec.data
    if ($rid) { Test-Endpoint "GET /receptions/{id}" $h "/receptions/$rid" }
  }

  Write-Step "BOUCHER - ecriture smoke"
  $supId = $null
  $versList = Invoke-Api -Headers $h -Path "/versements"
  if ($versList.ok) {
    $vArr = Get-UnwrappedData $versList.data
    if ($vArr -is [array] -and $vArr.Count -gt 0) {
      $supId = $vArr[0].fournisseur_user_id
    }
  }
  if (-not $supId -and $env:TEST_SUPPLIER_EMAIL) {
    $users = Invoke-Api -Headers $h -Path "/users"
    if ($users.ok) {
      $list = Get-UnwrappedData $users.data
      if ($list -is [array]) {
        $match = $list | Where-Object { $_.email -eq $env:TEST_SUPPLIER_EMAIL } | Select-Object -First 1
        if ($match) { $supId = $match.id }
      }
    }
  }
  if ($supId) {
      Test-Endpoint -Label "POST /versements" -Headers $h -Method POST -Path "/versements" -Body @{
        fournisseur_user_id = $supId
        montant             = 1
        mode_paiement       = "especes"
        date_versement      = (Get-Date -Format "yyyy-MM-dd")
        reference           = "SMOKE-$(Get-Random -Maximum 99999)"
      } -ExpectStatus @(200, 201, 422)
  } else {
    Write-Skip "POST /versements (fournisseur_user_id introuvable)"
  }

  $distId = $null
  $distList = Invoke-Api -Headers $h -Path "/distributions"
  if ($distList.ok) { $distId = Get-FirstId $distList.data }
  if ($distId) {
    [void](Test-Endpoint -Label "POST /receptions" -Headers $h -Method POST -Path "/receptions" -Body @{
      distribution_id = $distId
      date_reception  = (Get-Date -Format "yyyy-MM-dd")
      quantite        = 1
    } -ExpectStatus @(200, 201, 422))
  } else {
    Write-Skip "POST /receptions (distribution manquante)"
  }

  $stockId = $null
  $stocksR = Invoke-Api -Headers $h -Path "/stocks"
  if ($stocksR.ok) { $stockId = Get-FirstId $stocksR.data }
  if ($stockId) {
    [void](Test-Endpoint -Label "POST /stocks/{id}/ajuster" -Headers $h -Method POST -Path "/stocks/$stockId/ajuster" -Body @{
      quantite = 0.1
      motif    = "smoke-test"
    } -ExpectStatus @(200, 201, 422))
  } else {
    Write-Skip "POST /stocks/{id}/ajuster (stock manquant)"
  }

  $produitId = $null
  $pr = Invoke-Api -Headers $h -Path "/produits"
  if ($pr.ok) { $produitId = Get-FirstId $pr.data }
  $clientId = $null
  $cl = Invoke-Api -Headers $h -Path "/clients"
  if ($cl.ok) { $clientId = Get-FirstId $cl.data }

  if ($produitId) {
    Test-Endpoint -Label "POST /ventes" -Headers $h -Method POST -Path "/ventes" -Body @{
      type_vente  = "comptoir"
      date_vente  = (Get-Date -Format "yyyy-MM-dd")
      lignes      = @(@{ produit_id = $produitId; quantite = 0.5; prix_unitaire = 1000 })
    } -ExpectStatus @(200, 201, 422)
  } else {
    Write-Skip "POST /ventes (produit manquant)"
  }
}

function Test-Unauthenticated() {
  Write-Step "SANS AUTH - HTTP 401 attendu"
  $noAuth = @{ Accept = "application/json" }
  [void](Test-Endpoint -Label "GET /auth/me (401)" -Headers $noAuth -Path "/auth/me" -ExpectStatus @(401, 403))
  [void](Test-Endpoint -Label "GET /boucheries (401)" -Headers $noAuth -Path "/boucheries" -ExpectStatus @(401, 403))
}

# --- Main ---
$base = Get-ApiBase
Write-Host "API: $base" -ForegroundColor White
Write-Host "Comptes: admin=$($env:TEST_ADMIN_EMAIL) fournisseur=$($env:TEST_SUPPLIER_EMAIL) boucher=$($env:TEST_BUTCHER_EMAIL)"

Test-Unauthenticated

$adminToken = Get-AuthToken $env:TEST_ADMIN_EMAIL $env:TEST_ADMIN_PASSWORD "admin"
$supplierToken = Get-AuthToken $env:TEST_SUPPLIER_EMAIL $env:TEST_SUPPLIER_PASSWORD "fournisseur"
$butcherToken = Get-AuthToken $env:TEST_BUTCHER_EMAIL $env:TEST_BUTCHER_PASSWORD "boucher"

$refTypes = @(
  "categorie_produit", "espece_animal", "unite_produit", "mode_paiement",
  "statut_animal", "type_vente", "statut_vente", "statut_livraison", "type_mouvement"
)

if ($adminToken) {
  $hA = New-AuthHeaders $adminToken
  Test-AuthRoutes $adminToken "admin"
  Test-Referentiels $hA $refTypes
  Test-AdminEndpoints $hA
  Write-Step "ADMIN - ecriture smoke (catalogue)"
  $brSmoke = Invoke-Api -Headers $hA -Path "/boucheries"
  $boucherieIdSmoke = if ($brSmoke.ok) { Get-FirstId $brSmoke.data } else { $null }
  if ($boucherieIdSmoke) {
    [void](Test-Endpoint -Label "POST /produits" -Headers $hA -Method POST -Path "/produits" -Body @{
      nom           = "Viande script $(Get-Random -Maximum 9999)"
      categorie     = "viande_rouge"
      boucherie_id  = $boucherieIdSmoke
      unite         = "kg"
      prix_unitaire = 2500
    } -ExpectStatus @(200, 201, 422))
    [void](Test-Endpoint -Label "POST /clients" -Headers $hA -Method POST -Path "/clients" -Body @{
      nom          = "Client script"
      telephone    = "600000099"
      boucherie_id = $boucherieIdSmoke
    } -ExpectStatus @(200, 201, 422, 500))
  } else {
    Write-Skip "POST /produits et POST /clients (boucherie_id requis, aucune boucherie)"
  }
}

if ($supplierToken) {
  $hS = New-AuthHeaders $supplierToken
  Test-AuthRoutes $supplierToken "fournisseur"
  Test-Referentiels $hS @("categorie_produit", "espece_animal", "mode_paiement")
  Test-SupplierEndpoints $hS
  $vers = Invoke-Api -Headers $hS -Path "/versements?statut=en_attente"
  if (-not $vers.ok) { $vers = Invoke-Api -Headers $hS -Path "/versements" }
  if ($vers.ok) {
    $vid = Get-FirstId $vers.data
    if ($vid) {
      [void](Test-Endpoint -Label "GET /versements/{id}" -Headers $hS -Path "/versements/$vid")
      [void](Test-Endpoint -Label "PATCH /versements/{id}/valider" -Headers $hS -Method PATCH -Path "/versements/$vid/valider" -ExpectStatus @(200, 422))
      [void](Test-Endpoint -Label "PATCH /versements/{id}/rejeter" -Headers $hS -Method PATCH -Path "/versements/$vid/rejeter" -Body @{ motif = "smoke-test" } -ExpectStatus @(200, 422))
    }
  }
  $dist = Invoke-Api -Headers $hS -Path "/distributions"
  if ($dist.ok) {
    $did = Get-FirstId $dist.data
    if ($did) {
      [void](Test-Endpoint -Label "PATCH /distributions/{id}/annuler" -Headers $hS -Method PATCH -Path "/distributions/$did/annuler" -ExpectStatus @(200, 422))
    }
  }
}

if ($butcherToken) {
  $hB = New-AuthHeaders $butcherToken
  Test-AuthRoutes $butcherToken "boucher"
  Test-Referentiels $hB @("categorie_produit", "type_vente", "mode_paiement")
  Test-ButcherEndpoints $hB
  $ventes = Invoke-Api -Headers $hB -Path "/ventes"
  if ($ventes.ok) {
    $vid = Get-FirstId $ventes.data
    if ($vid) {
      [void](Test-Endpoint -Label "PATCH /ventes/{id}/statut" -Headers $hB -Method PATCH -Path "/ventes/$vid/statut" -Body @{ statut = "validee" } -ExpectStatus @(200, 422))
      [void](Test-Endpoint -Label "POST /ventes/{id}/livraison" -Headers $hB -Method POST -Path "/ventes/$vid/livraison" -Body @{
        adresse_livraison = "Smoke test"
        date_prevue       = (Get-Date -Format "yyyy-MM-dd")
      } -ExpectStatus @(200, 201, 422))
      [void](Test-Endpoint -Label "PATCH /ventes/{id}/livraison" -Headers $hB -Method PATCH -Path "/ventes/$vid/livraison" -Body @{ statut = "livree" } -ExpectStatus @(200, 422))
      [void](Test-Endpoint -Label "POST /ventes/{id}/paiements" -Headers $hB -Method POST -Path "/ventes/$vid/paiements" -Body @{
        montant       = 100
        mode_paiement = "especes"
      } -ExpectStatus @(200, 201, 422))
    }
  }
}

if ($adminToken -and -not $env:SKIP_LOGOUT) {
  $hLogout = New-AuthHeaders $adminToken
  [void](Test-Endpoint -Label "POST /auth/logout" -Headers $hLogout -Method POST -Path "/auth/logout" -ExpectStatus @(200, 204))
}

Write-Step "RESUME"
Write-Host "  Reussis : $script:Passed" -ForegroundColor Green
Write-Host "  Echecs  : $script:Failed" -ForegroundColor $(if ($script:Failed -gt 0) { "Red" } else { "Green" })
Write-Host "  Ignores : $script:Skipped" -ForegroundColor DarkYellow
if ($script:Failed -gt 0) { exit 1 }
exit 0

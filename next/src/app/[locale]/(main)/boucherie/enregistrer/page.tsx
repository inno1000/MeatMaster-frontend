"use client";

import { useForm, Controller } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ButcherFormSchema,
  type ButcherFormInput,
} from "@/lib/schemas/butcher";
import { useCreateButcher } from "@/lib/hooks/use-butchers";
import { cn } from "@/lib/utils";
import { nativeSelectClass } from "@/lib/ui-classes";
import { AudioRecorder } from "@/components/shared/audio-recorder";

const CITIES = [
  "Ngaoundéré",
  "Douala",
  "Yaoundé",
  "Garoua",
  "Maroua",
  "Bertoua",
  "Maiganga",
];

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const OWNERS = ["Inno", "Batouri", "Toto", "Ali"];

const SPECS = ["boeuf", "mouton", "chèvre", "poulet"];

export default function BoucherieEnregistrerPage() {
  const t = useTranslations("boucherie");
  const createButcher = useCreateButcher();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ButcherFormInput>({
    resolver: formResolver(ButcherFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: CITIES[0],
      postal_code: "",
      phone: "",
      email: "",
      website: "",
      openingHour: "08:00",
      closingHour: "18:00",
      openingDays: [],
      owner: OWNERS[0],
      specialties: [],
    },
  });

  const onSubmit = handleSubmit((data) => {
    createButcher.mutate(data);
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
        <p className="text-muted-foreground">{t("createSubtitle")}</p>
      </div>
      <ParentCard title={t("createTitle")}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t("address")}</Label>
            <Input id="address" {...register("address")} />
            {errors.address ? (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">{t("city")}</Label>
              <select
                id="city"
                className={nativeSelectClass}
                {...register("city")}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal">{t("postal")}</Label>
              <Input id="postal" {...register("postal_code")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">{t("website")}</Label>
            <Input id="website" placeholder="example.com" {...register("website")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="open">{t("opening")}</Label>
              <Input id="open" type="time" {...register("openingHour")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="close">{t("closing")}</Label>
              <Input id="close" type="time" {...register("closingHour")} />
            </div>
          </div>

          <Controller
            control={control}
            name="openingDays"
            render={({ field }) => (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t("days")}</legend>
                <div className="flex flex-wrap gap-3">
                  {DAYS.map((day) => {
                    const checked = field.value.includes(day);
                    return (
                      <label
                        key={day}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
                          checked ? "border-primary bg-primary/10" : "border-border",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-border"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, day]);
                            } else {
                              field.onChange(
                                field.value.filter((d: string) => d !== day),
                              );
                            }
                          }}
                        />
                        {day}
                      </label>
                    );
                  })}
                </div>
                {errors.openingDays ? (
                  <p className="text-sm text-destructive">
                    {errors.openingDays.message as string}
                  </p>
                ) : null}
              </fieldset>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="owner">{t("owner")}</Label>
            <select
              id="owner"
              className={nativeSelectClass}
              {...register("owner")}
            >
              {OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <Controller
            control={control}
            name="specialties"
            render={({ field }) => (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t("specialties")}</legend>
                <div className="flex flex-wrap gap-3">
                  {SPECS.map((spec) => {
                    const checked = field.value.includes(spec);
                    return (
                      <label
                        key={spec}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm capitalize",
                          checked ? "border-primary bg-primary/10" : "border-border",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-border"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, spec]);
                            } else {
                              field.onChange(
                                field.value.filter((s: string) => s !== spec),
                              );
                            }
                          }}
                        />
                        {spec}
                      </label>
                    );
                  })}
                </div>
                {errors.specialties ? (
                  <p className="text-sm text-destructive">
                    {errors.specialties.message as string}
                  </p>
                ) : null}
              </fieldset>
            )}
          />

          <AudioRecorder />
          <Button type="submit" disabled={createButcher.isPending}>
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

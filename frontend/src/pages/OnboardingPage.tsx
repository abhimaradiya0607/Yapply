import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  CircleAlert,
  Globe2,
  Languages,
  LoaderIcon,
  MapPin,
  Plus,
  RefreshCw,
  ShipWheelIcon,
  User,
} from "lucide-react";
import axios from "axios";

import useAuthUser from "../hooks/useAuthUser";
import {
  completeOnboarding,
  type BackendErrorResponse,
  type OnboardingData,
} from "../lib/api";
import { avatarStyles, LANGUAGES } from "../constants";


const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<BackendErrorResponse>(error)) {
    const responseData = error.response?.data;

    if (responseData?.errors?.length) {
      return responseData.errors.map((issue) => issue.message).join(", ");
    }

    return responseData?.message ?? "Something went wrong. Please try again.";
  }

  return "Something went wrong. Please try again.";
};

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<OnboardingData>({
    fullname: authUser?.fullname || "",
    bio: authUser?.bio || "",
    nativelanguage: authUser?.nativelanguage || "",
    learninglanguage: authUser?.learninglanguage || "",
    location: authUser?.location || "",
    profileurl:authUser?.profileurl || "",
  });

  // Preview-only avatar seed. Purely cosmetic — the onboarding request
  // payload and avatar persistence logic are unchanged.
  const [avatarSeed, setAvatarSeed] = useState(authUser?.id ?? "yapply");

  const { mutate: onboardingMutation, isPending, error } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
  },
})

  const onboardingErrorMessage = error ? getErrorMessage(error) : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.fullname.trim()) {
      toast.error("Full name is required");
      return;
    }
  
    if (!formState.bio.trim()) {
      toast.error("Bio is required");
      return;
    }
  
    if (!formState.nativelanguage) {
      toast.error("Please select your native language");
      return;
    }
  
    if (!formState.learninglanguage) {
      toast.error("Please select your learning language");
      return;
    }
  
    if (!formState.location.trim()) {
      toast.error("Location is required");
      return;
    }

    onboardingMutation(formState);
  };

  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  const handleRandomAvatar = () => {
    setIsAvatarLoading(true);
  
    const randomSeed = Math.floor(Math.random() * 100000);
  
    const randomStyle =
      avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
  
    const randomAvatar = `https://api.dicebear.com/9.x/${randomStyle}/svg?seed=${randomSeed}`;
  
    const avatarImage = new Image();
  
    avatarImage.onload = () => {
      // Update the avatar only after the image has loaded.
      setFormState((previousState) => ({
        ...previousState,
        profileurl: randomAvatar,
      }));
  
      setIsAvatarLoading(false);
      toast.success("Random profile picture generated");
    };
  
    avatarImage.onerror = () => {
      setIsAvatarLoading(false);
      toast.error("Unable to generate profile picture");
    };
  
    avatarImage.src = randomAvatar;
  };

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden bg-page px-4 py-6 font-sans text-foreground sm:px-6 lg:flex lg:items-center lg:justify-center"
      style={{
        backgroundImage:
          "radial-gradient(rgba(100, 116, 139, 0.18) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      {/* Onboarding shell: purple/indigo accent border wraps the whole card */}
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[20px] border-[3px] border-indigo-100 bg-surface shadow-[0_20px_45px_-25px_rgba(99,102,241,0.35)] lg:flex lg:min-h-[680px]">
        {/* Left form panel */}
        <section className="flex w-full min-w-0 flex-col p-6 sm:p-10 lg:w-1/2 lg:p-12">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Languages className="size-8 text-brand" aria-hidden="true" />
              <span className="text-[22px] font-semibold leading-none text-brand">
                Yapply
              </span>
            </div>

            <span className="rounded-full border border-border bg-brand-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
              Step 2 of 2
            </span>
          </div>

          <div className="w-full min-w-0 max-w-md">
            <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-7">
              {Boolean(error) && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3.5 text-rose-800 shadow-sm"
                >
                  <CircleAlert
                    className="mt-0.5 size-5 shrink-0 text-rose-600"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold leading-5">
                      Unable to save your profile
                    </p>
                    <p className="mt-1 break-words text-[13px] leading-5 text-rose-700">
                      {onboardingErrorMessage}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.6px] sm:text-[34px]">
                  Complete your profile
                </h1>
                <p className="text-[15px] leading-6 text-muted">
                  Tell others about yourself and your language learning goals.
                </p>
              </div>

              {/* Avatar preview + cosmetic randomizer */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border border-border bg-brand-soft">
                    {formState.profileurl ? (
                      <img
                        src={formState.profileurl}
                        alt="Profile avatar"
                        className="size-full object-cover"
                      />
                    ) : (
                      <User className="size-10 text-brand" aria-hidden="true" />
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-surface bg-brand text-white">
                    <Plus className="size-4" aria-hidden="true" />
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  disabled={isAvatarLoading}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-[13px] font-medium text-brand transition-colors duration-150 hover:bg-field"
                >
                      {isAvatarLoading ? (
                      <>
                        <span
                          className="loading loading-spinner loading-xs"
                          aria-hidden="true"
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw
                          className="size-4"
                          aria-hidden="true"
                        />
                        Generate Random Avatar
                      </>
                    )}
                </button>
              </div>

              <div className="space-y-5">
                <div className="w-full">
                  <label
                    htmlFor="fullname"
                    className="mb-2 block text-[14px] font-medium leading-5"
                  >
                    Full name
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="John Doe"
                    className="h-12 w-full rounded-[10px] border border-border bg-field px-3.5 text-[15px] text-foreground outline-none transition duration-150 placeholder:text-subtle focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                    value={formState.fullname}
                    onChange={(e) =>
                      setFormState({ ...formState, fullname: e.target.value })
                    }
                    // required
                  />
                </div>

                <div className="w-full">
                  <label
                    htmlFor="bio"
                    className="mb-2 block text-[14px] font-medium leading-5"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    placeholder="Tell others about yourself and your language learning goals"
                    className="h-[90px] w-full resize-none rounded-[10px] border border-border bg-field px-3.5 py-3 text-[15px] text-foreground outline-none transition duration-150 placeholder:text-subtle focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                    value={formState.bio}
                    onChange={(e) =>
                      setFormState({ ...formState, bio: e.target.value })
                    }
                    // required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="w-full">
                    <label
                      htmlFor="nativelanguage"
                      className="mb-2 block text-[14px] font-medium leading-5"
                    >
                      Native Language
                    </label>
                    <select
                      name="nativelanguage"
                      className="h-12 w-full rounded-[10px] border border-border bg-field px-3.5 text-[15px] text-foreground outline-none transition duration-150 placeholder:text-subtle focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                      value={formState.nativelanguage}
                      onChange={(e) =>setFormState({...formState,nativelanguage: e.target.value,})}
                      // required
                 >
                    <option value="">Your native language</option>
                      {LANGUAGES.map((lang:string)=>(
                        <option key={`native-${lang}`} value={lang.toLowerCase()}>
                          {lang}
                        </option>
                      ))}
                        </select>
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="learninglanguage"
                      className="mb-2 block text-[14px] font-medium leading-5"
                    >
                      Learning Language
                    </label>
                    <select
                      name="learninglanguage"
                      className="h-12 w-full rounded-[10px] border border-border bg-field px-3.5 text-[15px] text-foreground outline-none transition duration-150 placeholder:text-subtle focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                      value={formState.learninglanguage}
                      onChange={(e) =>setFormState({...formState, learninglanguage: e.target.value,})}
                      // required
                    >
                    <option value="">Your Learning language</option>
                      {LANGUAGES.map((lang:string)=>(
                        <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                          {lang}
                        </option>
                      ))}
                        </select>
                  </div>
                </div>

                <div className="w-full">
                  <label
                    htmlFor="location"
                    className="mb-2 block text-[14px] font-medium leading-5"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle"
                      aria-hidden="true"
                    />
                    <input
                      id="location"
                      type="text"
                      placeholder="City, Country"
                      className="h-12 w-full rounded-[10px] border border-border bg-field pl-10 pr-3.5 text-[15px] text-foreground outline-none transition duration-150 placeholder:text-subtle focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                      value={formState.location}
                      onChange={(e) =>
                        setFormState({ ...formState, location: e.target.value })
                      }
                      // required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-brand px-4 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {!isPending ? (
                  <>
                    <ShipWheelIcon
                      className="loading loading-spinner loading-sm"
                      aria-hidden="true"
                    />
                    Complete onboarding...
                  </>
                ) : (
                  <>
                    <LoaderIcon className="animate-spin size-5 mr-2" aria-hidden="true" />
                    Onboarding...
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Right showcase panel */}
        <section className="hidden items-center justify-center bg-showcase lg:flex lg:w-1/2">
          <div className="w-full max-w-md p-8">
            <div className="relative mx-auto aspect-square max-w-sm">
              <img
                src="r.png"
                alt="Language connection illustration"
                className="h-auto max-h-[800px] w-full object-contain"
              />
            </div>

            <div className="mt-6 space-y-3 text-center">
              <h2 className="mx-auto max-w-[330px] text-[26px] font-semibold leading-tight sm:text-[28px]">
                Connect with language partners worldwide
              </h2>
              <p className="mx-auto max-w-[340px] text-[15px] leading-6 text-muted">
                Practice conversations, make friends, and improve your
                language skills together.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default OnboardingPage;

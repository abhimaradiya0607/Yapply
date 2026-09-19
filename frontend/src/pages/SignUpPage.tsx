import { useState, type FormEvent } from 'react'
import { CircleAlert, Languages } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signUp ,type BackendErrorResponse} from '../lib/api'
import axios from "axios";
import PageLoader from '../components/PageLoader'

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<BackendErrorResponse>(error)) {
    const responseData = error.response?.data;

    if (responseData?.errors?.length) {
      return responseData.errors
        .map((issue) => issue.message)
        .join(", ");
    }

    return (
      responseData?.message ??
      "Something went wrong. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
};

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullname: '',
    email: '',
    password: '',
  })

  const queryClient=useQueryClient();
  
  const {mutate:signupmutation,isPending,error}=useMutation({
    mutationFn:signUp,
    onSuccess:()=>queryClient.invalidateQueries({queryKey:["authUser"]}),
    onError: (mutationError) => {
      console.error("Signup mutation failed:", mutationError);
    },
  })

  const signupErrorMessage = error ? getErrorMessage(error) : null;

  const handleSignUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signupmutation(signupData);
  }


  return (
    <main className="min-h-screen bg-page px-4 py-6 font-sans text-foreground sm:px-6 sm:py-8 lg:flex lg:items-center lg:justify-center">
      <div className="mx-auto flex w-full max-w-5xl overflow-hidden rounded-[14px] border border-border bg-surface lg:min-h-[650px]">
        {/* SignUp form left side */}
        <div className="flex w-full flex-col p-6 sm:p-10 lg:w-1/2 lg:p-12">
          {/* Logo */}
          <div className="mb-12 flex items-center justify-start gap-2">
            <Languages className="size-8 text-brand" aria-hidden="true" />
            <span className="text-[22px] font-semibold leading-none text-brand">
              Yapply
            </span>
          </div>

          <div className="w-full max-w-md">
            <form onSubmit={handleSignUp}>
               {/* ERROR BLOCK — ABOVE THE FORM HEADING */}
               {Boolean(error) && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3.5 text-rose-800 shadow-sm"
              >
                <CircleAlert
                  className="mt-0.5 size-5 shrink-0 text-rose-600"
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-5">
                    Unable to create account
                  </p>

                  <p className="mt-1 break-words text-[13px] leading-5 text-rose-700">
                    {signupErrorMessage}
                  </p>
                </div>
              </div>
            )}

              <div className="space-y-7">
                <div className="space-y-2">
                  <h1 className="text-[30px] font-semibold leading-[1.25] tracking-[-0.6px] sm:text-[34px]">
                    Create an account
                  </h1>
                  <p className="text-[15px] leading-6 text-muted">
                    Join Yapply and start your language learning journey.
                  </p>
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
                      value={signupData.fullname}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          fullname: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[14px] font-medium leading-5"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john@gmail.com"
                      className="h-12 w-full rounded-[10px] border border-border bg-field px-3.5 text-[15px] text-foreground outline-none transition duration-150 placeholder:text-subtle focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[14px] font-medium leading-5"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      className="h-12 w-full rounded-[10px] border border-border bg-field px-3.5 text-[15px] text-foreground outline-none transition duration-150 placeholder:text-subtle focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="mt-1.5 text-[12px] leading-5 text-subtle">
                      Password must be at least 8 characters long.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2 text-[13px] leading-5 text-muted">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-brand"
                      required
                    />
                    <span>
                      I agree to the{' '}
                      <a
                        href="/terms"
                        className="text-brand transition-colors hover:text-brand-hover hover:underline"
                      >
                        terms of service
                      </a>{' '}
                      and{' '}
                      <a
                        href="/privacy"
                        className="text-brand transition-colors hover:text-brand-hover hover:underline"
                      >
                        privacy policy
                      </a>
                      .
                    </span>
                  </label>
                </div>
                    {/* {error &&(
                      <div className='alert alert-error mb-4'>
                        <span>{error.response.data.message}</span>
                      </div>
                    )} */}
                <button 
                  className="h-12 w-full rounded-[10px] bg-brand px-4 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover focus:outline-none focus:ring-4 focus:ring-brand/15"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"
                        aria-hidden="true"
                          />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <p className="text-center text-[14px] leading-5 text-muted">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-brand transition-colors hover:text-brand-hover hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* SignUp form right side */}
        <div className="hidden w-1/2 items-center justify-center bg-showcase lg:flex">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative mx-auto aspect-square max-w-sm">
              <img
                src="/r.png"
                alt="Language connection illustration"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-6 space-y-3 text-center">
              <h2 className="text-[22px] font-semibold leading-7">
                Connect with language partners worldwide
              </h2>
              <p className="text-[15px] leading-6 text-muted">
                Practice conversations, make friends, and improve your language
                skills together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default SignUpPage
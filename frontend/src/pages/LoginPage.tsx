import { useState, type FormEvent } from 'react'
import { CircleAlert, Eye, EyeOff, Languages } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import type { BackendErrorResponse } from '../lib/api'
import { getGoogleAuthUrl } from '../lib/googleOAuth'
import useLogin from '../hooks/useLogin'


const inputClass =
  'h-[58px] w-full rounded-[14px] border border-border bg-field px-4 text-[16px] text-foreground outline-none transition placeholder:text-subtle focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10'

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<BackendErrorResponse>(error)) {
    const responseData = error.response?.data

    if (responseData?.errors?.length) {
      return responseData.errors
        .map((issue) => issue.message)
        .join(', ')
    }

    return (
      responseData?.message ??
      'Unable to sign in. Please try again.'
    )
  }

  return 'Unable to sign in. Please try again.'
}


const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)



  const {loginMutation,isPending,error,} = useLogin()

    const loginErrorMessage = error ? getErrorMessage(error): null


  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginMutation(loginData)
  }


  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-3 py-3 font-sans text-foreground sm:px-5 sm:py-5">

      {/* Main authentication card */}
      <div className="flex w-full max-w-[1280px] overflow-hidden rounded-[20px] bg-surface shadow-[0_18px_45px_rgba(25,45,35,0.07)]">

        {/* Left side - Login form */}
        <section className="flex w-full flex-col px-6 py-7 sm:px-10 sm:py-9 lg:w-[55%] lg:px-12 lg:py-10">

          {/* Logo */}
          <div className="mb-8 flex items-center gap-2.5">
            <Languages
              className="size-7 text-brand"
              aria-hidden="true"
            />

            <span className="text-[27px] font-semibold tracking-[-0.7px] text-brand">
              Yapply
            </span>
          </div>


          <div className="w-full max-w-[500px]">

            <form onSubmit={handleLogin}>

              {/* Error message */}
              {loginErrorMessage && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800"
                >
                  <CircleAlert
                    className="mt-0.5 size-5 shrink-0 text-rose-600"
                    aria-hidden="true"
                  />
                  
                  <div>
                    <p className="text-[14px] font-semibold">
                      Unable to sign in
                    </p>

                    <p className="mt-1 text-[13px] text-rose-700">
                      {loginErrorMessage}
                    </p>
                  </div>
                </div>
              )}


              {/* Heading */}
              <div className="mb-7">
                <h1 className="text-[38px] font-semibold leading-[1.1] tracking-[-1.2px] sm:text-[42px]">
                  Welcome back
                </h1>

                <p className="mt-3 max-w-[470px] text-[16px] leading-[1.5] text-muted">
                  Your language partners are waiting. Probably
                  judging your pronunciation.
                </p>
              </div>


              {/* Form fields */}
              <div className="space-y-5">

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[16px] font-medium"
                  >
                    Email address
                  </label>
                  
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="hello@example.com"
                    className={inputClass}
                    value={loginData.email}
                    onChange={(event) =>
                      setLoginData({
                        ...loginData,
                        email: event.target.value,
                      })
                    }
                    required
                  />
                </div>


                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[16px] font-medium"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={`${inputClass} pr-14`}
                      value={loginData.password}
                      onChange={(event) =>
                        setLoginData({
                          ...loginData,
                          password: event.target.value,
                        })
                      }
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-brand"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>

                  </div>


                  <div className="mt-2 text-right">
                    <Link
                      to="/forgot-password"
                      className="text-[14px] font-medium text-brand transition hover:text-brand-hover"
                    >
                      Forgot password?
                    </Link>
                  </div>

                </div>

              </div>


              {/* Sign in button */}
              <button
                type="submit"
                disabled={isPending}
                className="mt-6 flex h-[58px] w-full items-center justify-center rounded-[14px] bg-brand text-[16px] font-semibold text-white shadow-[0_5px_12px_rgba(37,108,83,0.15)] transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? 'Signing in...' : 'Sign in'}
              </button>


              {/* Divider */}
              <div className="my-6 flex items-center gap-4 text-[13px] text-subtle">
                <span className="h-px flex-1 bg-border" />

                <span className="whitespace-nowrap">
                  or continue with
                </span>

                <span className="h-px flex-1 bg-border" />
              </div>


              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex h-[58px] w-full items-center justify-center gap-3 rounded-[14px] border border-border bg-white text-[16px] font-medium transition hover:bg-field"
              >
                <img
                  src="/google.svg"
                  alt=""
                  className="size-5"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />

                Continue with Google
              </button>


              {/* Signup */}
              <p className="mt-6 text-center text-[14px] text-muted">
                Don&apos;t have an account?{' '}

                <Link
                  to="/signup"
                  className="font-semibold text-brand transition hover:text-brand-hover"
                >
                  Create one
                </Link>
              </p>

            </form>

          </div>

        </section>


        {/* Right side - Illustration */}
        <aside className="hidden w-[45%] flex-col items-center justify-center bg-showcase px-8 py-8 lg:flex">

          <div className="flex w-full max-w-[430px] flex-col items-center justify-center">

            <img
              src="/loginimage.png"
              alt="Person ready for a language conversation"
              className="h-auto max-h-[300px] w-full object-contain"
              onError={(event) => {
                /*
                 * If this fires, the filename/path in public is incorrect.
                 * Make sure the image exists at:
                 * public/login-illustration.png
                 */
                event.currentTarget.style.display = 'none'
              }}
            />


            <div className="mt-5 text-center">

              <h2 className="text-[25px] font-semibold tracking-[-0.6px]">
                Ready for another conversation?
              </h2>

              <p className="mx-auto mt-3 max-w-[400px] text-[15px] leading-[1.5] text-muted">
                Your next language partner might be one hello
                away. No perfect pronunciation required.
              </p>

            </div>

          </div>

        </aside>

      </div>

    </main>
  )
}


export default LoginPage
import { LoaderIcon } from 'react-hot-toast'

const PageLoader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderIcon
        className="animate-spin text-primary"
        style={{
          width: 80,
          height: 80,
        }}
      />
    </div>
  )
}

export default PageLoader
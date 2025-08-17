import { poppinsFont } from "../../utils/gameWorldsConfig"

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-64" style={poppinsFont}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
}

export default LoadingSpinner

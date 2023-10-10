import { cn } from "@/lib/utils"
import { FC, HTMLAttributes } from "react"

export const LogoPrimary: FC<HTMLAttributes<SVGElement>> = ({ className, ...rest }) => {
    return (
        <svg className={cn("rounded-full", className)} {...rest} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 72 72">
            <path fill="#FF6200" d="M 24.169922 4.5585938 C 23.414922 4.5585937 22.802734 5.1707813 22.802734 5.9257812 C 22.802734 6.6807812 23.414922 7.2929688 24.169922 7.2929688 C 24.924922 7.2929688 25.535156 6.6807812 25.535156 5.9257812 C 25.535156 5.1707813 24.924922 4.5585938 24.169922 4.5585938 z M 40.964844 6.2871094 C 39.557844 6.2871094 38.417969 7.4269844 38.417969 8.8339844 C 38.417969 10.240984 39.557844 11.380859 40.964844 11.380859 C 42.371844 11.380859 43.511719 10.240984 43.511719 8.8339844 C 43.511719 7.4269844 42.371844 6.2871094 40.964844 6.2871094 z M 33.191406 12.126953 C 27.608406 12.126953 22.853844 15.625922 20.964844 20.544922 C 16.717844 21.190922 13.460938 24.846438 13.460938 29.273438 C 13.460937 30.936437 13.926609 32.486453 14.724609 33.814453 C 12.828609 35.541453 11.632812 38.021109 11.632812 40.787109 C 11.632812 45.475109 15.053203 49.355797 19.533203 50.091797 C 19.621203 55.587797 24.098234 60.017578 29.615234 60.017578 C 32.030234 60.017578 34.245422 59.167953 35.982422 57.751953 C 37.302422 58.991953 39.067484 59.765625 41.021484 59.765625 C 44.562484 59.765625 47.514469 57.270359 48.230469 53.943359 C 48.377469 53.949359 48.521922 53.964844 48.669922 53.964844 C 54.772922 53.964844 59.720703 49.018062 59.720703 42.914062 C 59.720703 40.717062 59.069844 38.674125 57.964844 36.953125 C 59.445844 35.813125 60.417969 34.041344 60.417969 32.027344 C 60.417969 29.105344 58.3985 26.671141 55.6875 25.994141 C 55.7215 25.638141 55.742188 25.279062 55.742188 24.914062 C 55.742188 18.659062 50.671016 13.587891 44.416016 13.587891 C 43.016016 13.587891 41.681359 13.853359 40.443359 14.318359 C 38.365359 12.935359 35.874406 12.126953 33.191406 12.126953 z M 18.462891 14.253906 C 17.405891 14.253906 16.547875 15.111922 16.546875 16.169922 C 16.546875 17.227922 17.404891 18.085938 18.462891 18.085938 C 19.520891 18.085938 20.378906 17.227922 20.378906 16.169922 C 20.378906 15.111922 19.520891 14.253906 18.462891 14.253906 z M 33.871094 18.994141 C 37.059094 18.994141 39.234375 20.785156 39.234375 20.785156 C 39.234375 20.785156 40.633625 20.103516 42.390625 20.103516 C 46.526625 20.103516 49.892578 23.468469 49.892578 27.605469 C 49.892578 28.136469 49.767578 29.259766 49.767578 29.259766 C 50.656578 29.392766 53.441406 30.092906 53.441406 33.003906 C 53.441406 35.172906 51.548891 36.191281 51.212891 36.488281 C 51.774891 37.259281 52.912109 38.978625 52.912109 41.265625 C 52.912109 45.287625 49.641141 48.558547 45.619141 48.560547 C 45.265141 48.560547 44.412109 48.509766 44.412109 48.509766 C 44.229109 50.428766 42.778406 52.962891 39.816406 52.962891 C 37.595406 52.962891 36.314922 51.291219 36.044922 51.074219 C 35.580922 51.458219 33.954156 53.154297 31.160156 53.154297 C 27.601156 53.154297 24.658562 50.258266 24.601562 46.697266 L 24.587891 45.783203 C 23.050891 45.719203 18.605469 44.477344 18.605469 39.652344 C 18.605469 36.367344 21.257812 34.566406 21.257812 34.566406 C 21.257812 34.566406 19.889187 32.736063 19.992188 30.914062 C 20.298188 25.499063 25.386719 25.273438 25.386719 25.273438 C 25.386719 25.273437 27.295094 18.994141 33.871094 18.994141 z M 60.203125 20.412109 C 59.013125 20.412109 58.048828 21.377359 58.048828 22.568359 C 58.048828 23.759359 59.012125 24.724609 60.203125 24.724609 C 61.394125 24.724609 62.359375 23.759359 62.359375 22.568359 C 62.359375 21.377359 61.394125 20.412109 60.203125 20.412109 z M 39.318359 26.394531 C 37.417359 26.394531 36.846641 28.199219 35.806641 28.199219 C 34.716641 28.199219 34.02025 26.947266 32.40625 26.947266 C 29.04425 26.947266 28.272188 29.920484 27.742188 31.521484 C 27.151188 33.308484 25.158938 39.627453 24.960938 40.439453 C 24.265938 43.292453 26.906297 44.404297 28.154297 44.404297 C 29.780297 44.404297 30.618484 43.050406 31.021484 42.066406 C 31.380484 41.190406 34.488687 33.409859 34.554688 33.255859 C 34.952687 32.329859 35.496125 32.134953 35.953125 32.251953 C 36.558125 32.405953 36.839391 32.933625 36.525391 33.890625 C 36.225391 34.802625 34.688266 38.48425 34.197266 39.78125 C 33.537266 41.52625 34.401531 42.279297 35.519531 42.279297 C 36.637531 42.279297 37.382203 41.419422 37.908203 40.232422 C 38.369203 39.189422 41.482703 33.207297 41.845703 32.404297 C 42.239703 31.534297 42.693594 31.293297 43.183594 31.404297 C 43.868594 31.559297 43.843484 32.148812 43.396484 33.132812 C 42.949484 34.116813 41.758859 36.662172 41.130859 37.951172 C 40.632859 38.973172 40.101562 39.649641 40.101562 41.306641 C 40.101562 44.547641 43.577594 45.376953 45.558594 45.376953 C 46.927594 45.376953 47.794922 44.750391 47.794922 43.900391 C 47.794922 42.877391 46.686906 42.705594 45.378906 42.558594 C 44.099906 42.414594 43.857422 41.530297 43.857422 40.904297 C 43.857422 40.278297 44.230297 38.852562 45.154297 36.726562 C 45.833297 35.164562 47.523438 31.539266 47.523438 30.197266 C 47.523437 28.360266 46.048422 27.177734 44.482422 27.177734 C 42.730422 27.177734 42.427125 27.880859 41.953125 27.880859 C 41.378125 27.880859 40.709359 26.394531 39.318359 26.394531 z M 67.328125 28.464844 C 66.681125 28.464844 66.158203 28.987766 66.158203 29.634766 C 66.158203 30.281766 66.681125 30.806641 67.328125 30.806641 C 67.975125 30.806641 68.5 30.281766 68.5 29.634766 C 68.5 28.987766 67.975125 28.464844 67.328125 28.464844 z M 8.5410156 32.085938 C 7.1340156 32.085938 5.9941406 33.225813 5.9941406 34.632812 C 5.9941406 36.039812 7.1340156 37.179688 8.5410156 37.179688 C 9.9480156 37.179688 11.087891 36.039812 11.087891 34.632812 C 11.087891 33.226813 9.9480156 32.085938 8.5410156 32.085938 z M 64.158203 36.033203 C 63.288203 36.033203 62.582031 36.738422 62.582031 37.607422 C 62.582031 38.477422 63.288203 39.183594 64.158203 39.183594 C 65.028203 39.183594 65.732422 38.477422 65.732422 37.607422 C 65.732422 36.737422 65.028203 36.033203 64.158203 36.033203 z M 16.574219 51.949219 C 15.926219 51.949219 15.400391 52.473094 15.400391 53.121094 C 15.400391 53.769094 15.926219 54.294922 16.574219 54.294922 C 17.222219 54.294922 17.746094 53.769094 17.746094 53.121094 C 17.746094 52.473094 17.222219 51.949219 16.574219 51.949219 z M 52.210938 56.046875 C 50.748938 56.046875 49.564453 57.232359 49.564453 58.693359 C 49.564453 60.155359 50.748937 61.339844 52.210938 61.339844 C 53.672938 61.339844 54.857422 60.155359 54.857422 58.693359 C 54.857422 57.231359 53.672938 56.046875 52.210938 56.046875 z M 35.677734 60.927734 C 34.775734 60.927734 34.043922 61.659547 34.044922 62.560547 C 34.044922 63.462547 34.775734 64.193359 35.677734 64.193359 C 36.579734 64.193359 37.310547 63.462547 37.310547 62.560547 C 37.310547 61.658547 36.579734 60.927734 35.677734 60.927734 z"></path>
        </svg>
    )
}

export const LogoForeground: FC<HTMLAttributes<SVGElement>> = ({ className, ...rest }) => {
    return (
        <svg className={cn("rounded-full", className)} {...rest} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 72 72">
            <path fill="#454545" d="M 24.169922 4.5585938 C 23.414922 4.5585937 22.802734 5.1707813 22.802734 5.9257812 C 22.802734 6.6807812 23.414922 7.2929688 24.169922 7.2929688 C 24.924922 7.2929688 25.535156 6.6807812 25.535156 5.9257812 C 25.535156 5.1707813 24.924922 4.5585938 24.169922 4.5585938 z M 40.964844 6.2871094 C 39.557844 6.2871094 38.417969 7.4269844 38.417969 8.8339844 C 38.417969 10.240984 39.557844 11.380859 40.964844 11.380859 C 42.371844 11.380859 43.511719 10.240984 43.511719 8.8339844 C 43.511719 7.4269844 42.371844 6.2871094 40.964844 6.2871094 z M 33.191406 12.126953 C 27.608406 12.126953 22.853844 15.625922 20.964844 20.544922 C 16.717844 21.190922 13.460938 24.846438 13.460938 29.273438 C 13.460937 30.936437 13.926609 32.486453 14.724609 33.814453 C 12.828609 35.541453 11.632812 38.021109 11.632812 40.787109 C 11.632812 45.475109 15.053203 49.355797 19.533203 50.091797 C 19.621203 55.587797 24.098234 60.017578 29.615234 60.017578 C 32.030234 60.017578 34.245422 59.167953 35.982422 57.751953 C 37.302422 58.991953 39.067484 59.765625 41.021484 59.765625 C 44.562484 59.765625 47.514469 57.270359 48.230469 53.943359 C 48.377469 53.949359 48.521922 53.964844 48.669922 53.964844 C 54.772922 53.964844 59.720703 49.018062 59.720703 42.914062 C 59.720703 40.717062 59.069844 38.674125 57.964844 36.953125 C 59.445844 35.813125 60.417969 34.041344 60.417969 32.027344 C 60.417969 29.105344 58.3985 26.671141 55.6875 25.994141 C 55.7215 25.638141 55.742188 25.279062 55.742188 24.914062 C 55.742188 18.659062 50.671016 13.587891 44.416016 13.587891 C 43.016016 13.587891 41.681359 13.853359 40.443359 14.318359 C 38.365359 12.935359 35.874406 12.126953 33.191406 12.126953 z M 18.462891 14.253906 C 17.405891 14.253906 16.547875 15.111922 16.546875 16.169922 C 16.546875 17.227922 17.404891 18.085938 18.462891 18.085938 C 19.520891 18.085938 20.378906 17.227922 20.378906 16.169922 C 20.378906 15.111922 19.520891 14.253906 18.462891 14.253906 z M 33.871094 18.994141 C 37.059094 18.994141 39.234375 20.785156 39.234375 20.785156 C 39.234375 20.785156 40.633625 20.103516 42.390625 20.103516 C 46.526625 20.103516 49.892578 23.468469 49.892578 27.605469 C 49.892578 28.136469 49.767578 29.259766 49.767578 29.259766 C 50.656578 29.392766 53.441406 30.092906 53.441406 33.003906 C 53.441406 35.172906 51.548891 36.191281 51.212891 36.488281 C 51.774891 37.259281 52.912109 38.978625 52.912109 41.265625 C 52.912109 45.287625 49.641141 48.558547 45.619141 48.560547 C 45.265141 48.560547 44.412109 48.509766 44.412109 48.509766 C 44.229109 50.428766 42.778406 52.962891 39.816406 52.962891 C 37.595406 52.962891 36.314922 51.291219 36.044922 51.074219 C 35.580922 51.458219 33.954156 53.154297 31.160156 53.154297 C 27.601156 53.154297 24.658562 50.258266 24.601562 46.697266 L 24.587891 45.783203 C 23.050891 45.719203 18.605469 44.477344 18.605469 39.652344 C 18.605469 36.367344 21.257812 34.566406 21.257812 34.566406 C 21.257812 34.566406 19.889187 32.736063 19.992188 30.914062 C 20.298188 25.499063 25.386719 25.273438 25.386719 25.273438 C 25.386719 25.273437 27.295094 18.994141 33.871094 18.994141 z M 60.203125 20.412109 C 59.013125 20.412109 58.048828 21.377359 58.048828 22.568359 C 58.048828 23.759359 59.012125 24.724609 60.203125 24.724609 C 61.394125 24.724609 62.359375 23.759359 62.359375 22.568359 C 62.359375 21.377359 61.394125 20.412109 60.203125 20.412109 z M 39.318359 26.394531 C 37.417359 26.394531 36.846641 28.199219 35.806641 28.199219 C 34.716641 28.199219 34.02025 26.947266 32.40625 26.947266 C 29.04425 26.947266 28.272188 29.920484 27.742188 31.521484 C 27.151188 33.308484 25.158938 39.627453 24.960938 40.439453 C 24.265938 43.292453 26.906297 44.404297 28.154297 44.404297 C 29.780297 44.404297 30.618484 43.050406 31.021484 42.066406 C 31.380484 41.190406 34.488687 33.409859 34.554688 33.255859 C 34.952687 32.329859 35.496125 32.134953 35.953125 32.251953 C 36.558125 32.405953 36.839391 32.933625 36.525391 33.890625 C 36.225391 34.802625 34.688266 38.48425 34.197266 39.78125 C 33.537266 41.52625 34.401531 42.279297 35.519531 42.279297 C 36.637531 42.279297 37.382203 41.419422 37.908203 40.232422 C 38.369203 39.189422 41.482703 33.207297 41.845703 32.404297 C 42.239703 31.534297 42.693594 31.293297 43.183594 31.404297 C 43.868594 31.559297 43.843484 32.148812 43.396484 33.132812 C 42.949484 34.116813 41.758859 36.662172 41.130859 37.951172 C 40.632859 38.973172 40.101562 39.649641 40.101562 41.306641 C 40.101562 44.547641 43.577594 45.376953 45.558594 45.376953 C 46.927594 45.376953 47.794922 44.750391 47.794922 43.900391 C 47.794922 42.877391 46.686906 42.705594 45.378906 42.558594 C 44.099906 42.414594 43.857422 41.530297 43.857422 40.904297 C 43.857422 40.278297 44.230297 38.852562 45.154297 36.726562 C 45.833297 35.164562 47.523438 31.539266 47.523438 30.197266 C 47.523437 28.360266 46.048422 27.177734 44.482422 27.177734 C 42.730422 27.177734 42.427125 27.880859 41.953125 27.880859 C 41.378125 27.880859 40.709359 26.394531 39.318359 26.394531 z M 67.328125 28.464844 C 66.681125 28.464844 66.158203 28.987766 66.158203 29.634766 C 66.158203 30.281766 66.681125 30.806641 67.328125 30.806641 C 67.975125 30.806641 68.5 30.281766 68.5 29.634766 C 68.5 28.987766 67.975125 28.464844 67.328125 28.464844 z M 8.5410156 32.085938 C 7.1340156 32.085938 5.9941406 33.225813 5.9941406 34.632812 C 5.9941406 36.039812 7.1340156 37.179688 8.5410156 37.179688 C 9.9480156 37.179688 11.087891 36.039812 11.087891 34.632812 C 11.087891 33.226813 9.9480156 32.085938 8.5410156 32.085938 z M 64.158203 36.033203 C 63.288203 36.033203 62.582031 36.738422 62.582031 37.607422 C 62.582031 38.477422 63.288203 39.183594 64.158203 39.183594 C 65.028203 39.183594 65.732422 38.477422 65.732422 37.607422 C 65.732422 36.737422 65.028203 36.033203 64.158203 36.033203 z M 16.574219 51.949219 C 15.926219 51.949219 15.400391 52.473094 15.400391 53.121094 C 15.400391 53.769094 15.926219 54.294922 16.574219 54.294922 C 17.222219 54.294922 17.746094 53.769094 17.746094 53.121094 C 17.746094 52.473094 17.222219 51.949219 16.574219 51.949219 z M 52.210938 56.046875 C 50.748938 56.046875 49.564453 57.232359 49.564453 58.693359 C 49.564453 60.155359 50.748937 61.339844 52.210938 61.339844 C 53.672938 61.339844 54.857422 60.155359 54.857422 58.693359 C 54.857422 57.231359 53.672938 56.046875 52.210938 56.046875 z M 35.677734 60.927734 C 34.775734 60.927734 34.043922 61.659547 34.044922 62.560547 C 34.044922 63.462547 34.775734 64.193359 35.677734 64.193359 C 36.579734 64.193359 37.310547 63.462547 37.310547 62.560547 C 37.310547 61.658547 36.579734 60.927734 35.677734 60.927734 z"></path>
        </svg>
    )
}

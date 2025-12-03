export function LoadingSpinnerSuspense() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-500/50 rounded-full animate-spin animation-delay-150"></div>
        </div>
        
        <div className="text-center space-y-2">
          {/* <p>
              <img 
                src="/teeth.png" 
                alt="DentaDesk Logo" 
                className="w-7 h-7 object-contain"
              />
          </p> */}
          <h2 className="text-xl font-semibold text-foreground">
            Denta
          </h2>
          <p className="text-sm text-muted-foreground animate-pulse">
            Chargement en cours...
          </p>
        </div>
        
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-primary to-emerald-500 rounded-full animate-pulse"></div>
        </div>
        
        {/* Points animés */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </div>
    </div>
  )
}
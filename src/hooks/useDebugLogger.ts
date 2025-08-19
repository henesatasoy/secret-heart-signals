import { useEffect, useCallback } from 'react'

// Console debugging utility for development
export const useDebugLogger = (componentName: string, enabled: boolean = process.env.NODE_ENV === 'development') => {
  
  const log = useCallback((message: string, data?: any) => {
    if (enabled) {
      console.log(`🔧 [${componentName}] ${message}`, data || '')
    }
  }, [componentName, enabled])

  const warn = useCallback((message: string, data?: any) => {
    if (enabled) {
      console.warn(`⚠️ [${componentName}] ${message}`, data || '')
    }
  }, [componentName, enabled])

  const error = useCallback((message: string, data?: any) => {
    console.error(`🚨 [${componentName}] ${message}`, data || '')
  }, [componentName])

  const trace = useCallback((functionName: string, params?: any) => {
    if (enabled) {
      console.log(`📍 [${componentName}::${functionName}]`, params || 'called')
    }
  }, [componentName, enabled])

  // Hook call tracer for debugging hook violations
  const traceHookCall = useCallback((hookName: string, params?: any) => {
    if (enabled) {
      console.log(`🪝 [${componentName}] Hook: ${hookName}`, params || '')
    }
  }, [componentName, enabled])

  useEffect(() => {
    if (enabled) {
      log('Component mounted/updated')
    }
    
    return () => {
      if (enabled) {
        log('Component cleanup')
      }
    }
  }, [log, enabled])

  return {
    log,
    warn,
    error,
    trace,
    traceHookCall
  }
}
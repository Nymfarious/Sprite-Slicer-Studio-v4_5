import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Info, 
  User, 
  Heart, 
  Code2, 
  Trash2,
  Bug,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

const APP_VERSION = '4.5.0-alpha'

export default function Settings() {
  const { user, isDevMode, signOut, clearDevMode } = useAuth()
  const navigate = useNavigate()
  const [creditsOpen, setCreditsOpen] = useState(false)
  const [devOptionsOpen, setDevOptionsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/auth')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleClearLocalStorage = () => {
    const keysToKeep = ['sprite-slicer-dev-mode']
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })
    toast.success('Local storage cleared', { description: 'App data has been reset' })
  }

  const handleClearDevMode = () => {
    clearDevMode()
    toast.info('Dev mode cleared', { description: 'You will need to sign in' })
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        {/* App Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="w-5 h-5" />
              App Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">App Version</span>
              <Badge variant="secondary">{APP_VERSION}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Language</span>
              <span className="text-white">English</span>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white">{user.email || 'N/A'}</span>
                </div>
                {isDevMode && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded">
                    <Bug className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-400 text-sm">Dev Mode Active</span>
                  </div>
                )}
                <Separator className="bg-gray-700" />
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">Not signed in</p>
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credits */}
        <Card className="bg-gray-800 border-gray-700">
          <Collapsible open={creditsOpen} onOpenChange={setCreditsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-700/50 transition-colors">
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Special Thanks & Credits
                  </span>
                  {creditsOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Built with assistance from */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Built with assistance from:</h4>
                  <ul className="space-y-1 text-gray-400 text-sm">
                    <li>• Claude (Anthropic)</li>
                    <li>• Lovable</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                {/* Powered by */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Powered by:</h4>
                  <ul className="space-y-1 text-gray-400 text-sm">
                    <li>• Supabase (Auth & Database)</li>
                    <li>• Google GenAI (Gemini)</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                {/* Open Source Libraries */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Open Source Libraries:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'TypeScript', 'Lucide Icons', 'Tanstack Query', 'React Router'].map((lib) => (
                      <Badge key={lib} variant="outline" className="border-gray-600 text-gray-400">
                        {lib}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Developer Options */}
        <Card className="bg-gray-800 border-gray-700">
          <Collapsible open={devOptionsOpen} onOpenChange={setDevOptionsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-700/50 transition-colors">
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Developer Options
                  </span>
                  {devOptionsOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Auth State */}
                <div className="p-3 bg-gray-900 rounded border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Current Auth State</h4>
                  <div className="space-y-1 text-xs font-mono text-gray-400">
                    <p>User ID: {user?.id || 'null'}</p>
                    <p>Email: {user?.email || 'null'}</p>
                    <p>Dev Mode: {isDevMode ? 'true' : 'false'}</p>
                  </div>
                </div>

                {/* Dev Mode Indicator */}
                {isDevMode && (
                  <div className="flex items-center justify-between p-3 bg-yellow-900/30 border border-yellow-700/50 rounded">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-400 text-sm font-medium">Dev Mode Active</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-yellow-700 text-yellow-400 hover:bg-yellow-900/50"
                      onClick={handleClearDevMode}
                    >
                      Clear
                    </Button>
                  </div>
                )}

                {/* Version Info */}
                <div className="p-3 bg-gray-900 rounded border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Build Info</h4>
                  <div className="space-y-1 text-xs font-mono text-gray-400">
                    <p>Version: {APP_VERSION}</p>
                    <p>Build: Pre-Alpha</p>
                    <p>Environment: {import.meta.env.MODE}</p>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Danger Zone */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Danger Zone</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-red-800 text-red-400 hover:bg-red-900/30"
                    onClick={handleClearLocalStorage}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Local Storage
                  </Button>
                  <p className="text-xs text-gray-500">
                    This will clear all saved preferences, library data, and cached assets.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  )
}

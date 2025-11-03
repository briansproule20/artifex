import { isSignedIn } from '@/echo';
import { CritiqueChat } from '@/components/critique-chat';
import { NavLayout } from '@/components/nav-layout';
import { EchoSignIn } from '@merit-systems/echo-next-sdk/client';

/**
 * Critique Page - AI Art Critic Chat Interface
 */
export default async function CritiquePage() {
  const _isSignedIn = await isSignedIn();

  return (
    <NavLayout>
      <div className="h-full flex flex-col">
        {!_isSignedIn ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Sign in to start critiquing</h2>
              <p className="text-gray-600">Connect with AI art critics to discuss and analyze artwork</p>
              <div className="pt-4">
                <EchoSignIn />
              </div>
            </div>
          </div>
        ) : (
          <CritiqueChat />
        )}
      </div>
    </NavLayout>
  );
}

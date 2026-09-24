import { LoaderIcon } from "lucide-react";

function ChatLoader() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <LoaderIcon className="size-10 animate-spin text-primary" />
      <p className="mt-4 text-center font-mono text-lg">Connecting to chat...</p>
    </div>
  );
}

export default ChatLoader;

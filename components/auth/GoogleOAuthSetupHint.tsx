export default function GoogleOAuthSetupHint() {
  return (
    <div className="text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-3 space-y-2">
      <p className="font-medium">Google sign-in needs OAuth credentials</p>
      <ol className="list-decimal list-inside space-y-1.5 text-amber-950">
        <li>
          Open{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:no-underline"
          >
            Google Cloud Console → Credentials
          </a>
          .
        </li>
        <li>
          Create an <strong>OAuth 2.0 Client ID</strong> (application type:{" "}
          <strong>Web application</strong>).
        </li>
        <li>
          Under <strong>Authorized redirect URIs</strong>, add exactly (adjust the
          port if your dev server is not on 3000):
        </li>
      </ol>
      <p className="pl-4 font-mono text-xs bg-amber-100/80 rounded px-2 py-1.5 break-all">
        http://localhost:3000/api/auth/google/callback
      </p>
      <p className="text-xs text-amber-800">
        In the project root, create or edit{" "}
        <code className="bg-amber-100 px-1 rounded">.env.local</code> and set:
      </p>
      <pre className="text-xs bg-amber-100/80 rounded px-2 py-2 overflow-x-auto">
        {`GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret`}
      </pre>
      <p className="text-xs text-amber-800">
        Optionally set{" "}
        <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_APP_URL=http://localhost:3000</code>{" "}
        so redirects always match what you registered in Google. Restart{" "}
        <code className="bg-amber-100 px-1 rounded">npm run dev</code> after saving.
      </p>
    </div>
  );
}

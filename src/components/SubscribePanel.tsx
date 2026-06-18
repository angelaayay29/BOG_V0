import { useState } from "react";
import { getSubscriberCount, subscribe } from "../utils/subscriptions";

export function SubscribePanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(getSubscriberCount);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = subscribe(email);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage("You're on the list — we'll notify you when a new menu publishes.");
    setEmail("");
    setSubscriberCount(getSubscriberCount());
  };

  return (
    <aside className="subscribe-panel" aria-labelledby="subscribe-heading">
      <h2 id="subscribe-heading">Get notified</h2>
      <p>New menu published each sprint — one email, executive summary only.</p>
      <form className="subscribe-form" onSubmit={handleSubmit}>
        <label htmlFor="subscribe-email" className="sr-only">
          Work email for newsletter notifications
        </label>
        <input
          id="subscribe-email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <button type="submit" className="btn btn-primary">
          Notify me
        </button>
      </form>
      {message ? (
        <p className="subscribe-panel__message" role="status">
          {message}
        </p>
      ) : null}
      <p className="subscribe-panel__note">
        Simulated for now — connects to your distribution backend later.
        {subscriberCount > 0 ? ` ${subscriberCount} leader(s) subscribed in this browser.` : ""}
      </p>
    </aside>
  );
}

import { useState } from "react";
import { TextInput, Button } from "@mantine/core";
import { IconMail } from "@tabler/icons-react";
import { subscribe } from "../server/subscribers";

interface EmailSignupProps {
  compact?: boolean;
}

export function EmailSignup({ compact = false }: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setStatus("loading");

    try {
      const result = await subscribe({ data: email });
      setStatus("success");
      setMessage(result.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={compact ? "" : "py-8"}>
        <p className="text-green-700 font-semibold">{message}</p>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "py-8"}>
      {!compact && (
        <>
          <h2 className="text-xl font-extrabold font-hepta-slab mb-2">
            Get the weekly digest
          </h2>
          <p className="text-gray-600 mb-4">
            Sign up for a weekly email with upcoming events in Beacon.
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <TextInput
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
            if (status === "error") setStatus("idle");
          }}
          error={status === "error" ? message : undefined}
          leftSection={<IconMail size={16} />}
          className="flex-1"
          size={compact ? "sm" : "md"}
          required
        />
        <Button
          type="submit"
          loading={status === "loading"}
          size={compact ? "sm" : "md"}
          color="dark"
        >
          Sign up
        </Button>
      </form>
    </div>
  );
}

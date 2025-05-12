import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">Reminder App</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const reminders = useQuery(api.reminders.list);
  const createReminder = useMutation(api.reminders.create);
  const removeReminder = useMutation(api.reminders.remove);
  
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<"email" | "sms">("email");
  const [dateTime, setDateTime] = useState("");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createReminder({
        message,
        method,
        scheduledTime: new Date(dateTime).getTime(),
      });
      setMessage("");
      setDateTime("");
      toast.success("Reminder created!");
    } catch (error) {
      toast.error("Failed to create reminder");
    }
  }

  async function handleDelete(reminderId: Id<"reminders">) {
    try {
      await removeReminder({ reminderId });
      toast.success("Reminder deleted");
    } catch (error) {
      toast.error("Failed to delete reminder");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold accent-text mb-4">Reminder App</h1>
        <Authenticated>
          <p className="text-xl text-slate-600">
            Welcome back, {loggedInUser?.email ?? "friend"}!
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600">Sign in to create reminders</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reminder Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as "email" | "sms")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create Reminder
          </button>
        </form>

        {reminders && reminders.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Your Reminders</h2>
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className="border rounded-lg p-4 shadow-sm flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium">{reminder.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(reminder.scheduledTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Method: {reminder.method}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {reminder.status}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(reminder._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Authenticated>
    </div>
  );
}

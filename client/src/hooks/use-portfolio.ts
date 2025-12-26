import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertMessage } from "@shared/schema";

/* ---------------------------------- */
/* Generic fetch helper */
/* ---------------------------------- */

async function fetchAndParse<T>(
  path: string,
  schema: { parse: (data: unknown) => T },
  errorMessage: string
): Promise<T> {
  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`${errorMessage} (${res.status})`);
  }

  return schema.parse(await res.json());
}

/* ---------------------------------- */
/* Queries */
/* ---------------------------------- */

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      fetchAndParse(
        api.projects.list.path,
        api.projects.list.responses[200],
        "Failed to fetch projects"
      ),
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: () =>
      fetchAndParse(
        api.skills.list.path,
        api.skills.list.responses[200],
        "Failed to fetch skills"
      ),
  });
}

export function useExperiences() {
  return useQuery({
    queryKey: ["experiences"],
    queryFn: () =>
      fetchAndParse(
        api.experiences.list.path,
        api.experiences.list.responses[200],
        "Failed to fetch experiences"
      ),
  });
}

/* ---------------------------------- */
/* Mutation */
/* ---------------------------------- */

export function useSendMessage() {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["send-message"],

    mutationFn: async (data: InsertMessage) => {
      const res = await fetch(api.messages.create.path, {
        method: api.messages.create.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message ?? "Validation failed");
        }

        throw new Error(`Request failed (${res.status})`);
      }

      return api.messages.create.responses[201].parse(await res.json());
    },

    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "I’ll get back to you soon.",
      });
    },

    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

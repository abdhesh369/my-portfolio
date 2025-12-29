import { z } from "zod";
import { projectSchema, skillSchema, experienceSchema, messageSchema, insertProjectApiSchema, insertSkillApiSchema, insertExperienceApiSchema, insertMessageApiSchema, } from "./schema";
// ==================== ERROR SCHEMAS ====================
export const errorSchemas = {
    validation: z.object({
        message: z.string(),
        errors: z
            .array(z.object({
            path: z.string(),
            message: z.string(),
        }))
            .optional(),
    }),
    notFound: z.object({
        message: z.string(),
    }),
    badRequest: z.object({
        message: z.string(),
    }),
    internal: z.object({
        message: z.string(),
    }),
};
// ==================== API DEFINITION ====================
export const api = {
    // ---------- PROJECTS ----------
    projects: {
        list: {
            method: "GET",
            path: "/api/projects",
            responses: {
                200: z.array(projectSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET",
            path: "/api/projects/:id",
            responses: {
                200: projectSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST",
            path: "/api/projects",
            input: insertProjectApiSchema,
            responses: {
                201: projectSchema,
                400: errorSchemas.validation,
                500: errorSchemas.internal,
            },
        },
        update: {
            method: "PUT",
            path: "/api/projects/:id",
            input: insertProjectApiSchema.partial(),
            responses: {
                200: projectSchema,
                400: errorSchemas.validation,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE",
            path: "/api/projects/:id",
            responses: {
                204: z.void(),
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },
    // ---------- SKILLS ----------
    skills: {
        list: {
            method: "GET",
            path: "/api/skills",
            responses: {
                200: z.array(skillSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET",
            path: "/api/skills/:id",
            responses: {
                200: skillSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST",
            path: "/api/skills",
            input: insertSkillApiSchema,
            responses: {
                201: skillSchema,
                400: errorSchemas.validation,
                500: errorSchemas.internal,
            },
        },
        update: {
            method: "PUT",
            path: "/api/skills/:id",
            input: insertSkillApiSchema.partial(),
            responses: {
                200: skillSchema,
                400: errorSchemas.validation,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE",
            path: "/api/skills/:id",
            responses: {
                204: z.void(),
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },
    // ---------- EXPERIENCES ----------
    experiences: {
        list: {
            method: "GET",
            path: "/api/experiences",
            responses: {
                200: z.array(experienceSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET",
            path: "/api/experiences/:id",
            responses: {
                200: experienceSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST",
            path: "/api/experiences",
            input: insertExperienceApiSchema,
            responses: {
                201: experienceSchema,
                400: errorSchemas.validation,
                500: errorSchemas.internal,
            },
        },
        update: {
            method: "PUT",
            path: "/api/experiences/:id",
            input: insertExperienceApiSchema.partial(),
            responses: {
                200: experienceSchema,
                400: errorSchemas.validation,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE",
            path: "/api/experiences/:id",
            responses: {
                204: z.void(),
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },
    // ---------- MESSAGES ----------
    messages: {
        list: {
            method: "GET",
            path: "/api/messages",
            responses: {
                200: z.array(messageSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET",
            path: "/api/messages/:id",
            responses: {
                200: messageSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST",
            path: "/api/messages",
            input: insertMessageApiSchema,
            responses: {
                201: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    data: messageSchema,
                }),
                400: errorSchemas.validation,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE",
            path: "/api/messages/:id",
            responses: {
                204: z.void(),
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },
};

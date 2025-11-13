import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ Dashboard ============
  dashboard: router({
    stats: protectedProcedure
      .input(z.object({ branchId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getDashboardStats(input?.branchId);
      }),
  }),

  // ============ Currencies ============
  currencies: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCurrencies();
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getCurrencyById(input);
    }),
  }),

  // ============ Branches ============
  branches: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllBranches();
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getBranchById(input);
    }),
    create: protectedProcedure
      .input(
        z.object({
          code: z.string(),
          nameAr: z.string(),
          nameEn: z.string().optional(),
          isMain: z.boolean().default(false),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createBranch({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
  }),

  // ============ Account Categories ============
  accountCategories: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllAccountCategories();
    }),
  }),

  // ============ Chart of Accounts ============
  chartOfAccounts: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllChartOfAccounts();
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getChartOfAccountById(input);
    }),
    create: protectedProcedure
      .input(
        z.object({
          code: z.string(),
          nameAr: z.string(),
          nameEn: z.string().optional(),
          parentId: z.number().optional(),
          categoryId: z.number(),
          level: z.number().default(1),
          isParent: z.boolean().default(false),
          description: z.string().optional(),
          currencyIds: z.array(z.number()).min(1, "يجب اختيار عملة واحدة على الأقل"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { currencyIds, ...accountData } = input;

        // Create account
        const result = await db.createChartOfAccount({
          ...accountData,
          createdBy: ctx.user.id,
        });

        const accountId = Number((result as any).insertId);

        // Set currencies
        await db.setAccountCurrencies(accountId, currencyIds);

        return { id: accountId };
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          code: z.string().optional(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
          currencyIds: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, currencyIds, ...updateData } = input;

        // Update account
        await db.updateChartOfAccount(id, updateData);

        // Update currencies if provided
        if (currencyIds) {
          await db.setAccountCurrencies(id, currencyIds);
        }

        return { success: true };
      }),
    getCurrencies: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getAccountCurrencies(input);
    }),
  }),

  // ============ Analytical Account Types ============
  analyticalAccountTypes: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllAnalyticalAccountTypes();
    }),
  }),

  // ============ Analytical Accounts ============
  analyticalAccounts: router({
    list: protectedProcedure
      .input(z.object({ branchId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllAnalyticalAccounts(input?.branchId);
      }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getAnalyticalAccountById(input);
    }),
    create: protectedProcedure
      .input(
        z.object({
          code: z.string(),
          nameAr: z.string(),
          nameEn: z.string().optional(),
          chartAccountId: z.number(),
          typeId: z.number(),
          branchId: z.number(),
          openingBalance: z.number().default(0),
          currencyId: z.number(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createAnalyticalAccount({
          ...input,
          currentBalance: input.openingBalance,
          createdBy: ctx.user.id,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          code: z.string().optional(),
          nameAr: z.string().optional(),
          nameEn: z.string().optional(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        await db.updateAnalyticalAccount(id, updateData);
        return { success: true };
      }),
  }),

  // ============ Vouchers ============
  vouchers: router({
    list: protectedProcedure
      .input(
        z
          .object({
            branchId: z.number().optional(),
            type: z.enum(["receipt", "payment"]).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await db.getAllVouchers(input?.branchId, input?.type);
      }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getVoucherById(input);
    }),
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["receipt", "payment"]),
          voucherType: z.enum(["cash", "bank"]),
          date: z.string().or(z.date()),
          amount: z.number().positive(),
          currencyId: z.number(),
          fromAccountId: z.number().optional(),
          toAccountId: z.number().optional(),
          branchId: z.number(),
          statement: z.string(),
          referenceNumber: z.string().optional(),
          attachmentUrl: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Generate voucher number
        const prefix = input.type === "receipt" ? "REC" : "PAY";
        const timestamp = Date.now();
        const voucherNumber = `${prefix}-${timestamp}`;

        // Create voucher
        const voucherResult = await db.createVoucher({
          ...input,
          voucherNumber,
          date: new Date(input.date),
          status: "approved",
          createdBy: ctx.user.id,
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        });

        const voucherId = Number((voucherResult as any).insertId);

        // Update account balances
        if (input.type === "payment" && input.fromAccountId) {
          await db.updateAccountBalance(input.fromAccountId, input.amount, false);
        }
        if (input.type === "receipt" && input.toAccountId) {
          await db.updateAccountBalance(input.toAccountId, input.amount, true);
        }

        // Create journal entry
        const entryNumber = `JE-${timestamp}`;
        const lines = [];

        if (input.type === "payment") {
          // Debit expense, Credit cash/bank
          if (input.toAccountId) {
            lines.push({
              accountId: input.toAccountId,
              type: "debit" as const,
              amount: input.amount,
              currencyId: input.currencyId,
              description: input.statement,
            });
          }
          if (input.fromAccountId) {
            lines.push({
              accountId: input.fromAccountId,
              type: "credit" as const,
              amount: input.amount,
              currencyId: input.currencyId,
              description: input.statement,
            });
          }
        } else {
          // Debit cash/bank, Credit revenue
          if (input.toAccountId) {
            lines.push({
              accountId: input.toAccountId,
              type: "debit" as const,
              amount: input.amount,
              currencyId: input.currencyId,
              description: input.statement,
            });
          }
          if (input.fromAccountId) {
            lines.push({
              accountId: input.fromAccountId,
              type: "credit" as const,
              amount: input.amount,
              currencyId: input.currencyId,
              description: input.statement,
            });
          }
        }

        if (lines.length > 0) {
          await db.createJournalEntry(
            {
              entryNumber,
              date: new Date(input.date),
              description: input.statement,
              voucherId,
              branchId: input.branchId,
              status: "posted",
              createdBy: ctx.user.id,
            },
            lines as any
          );
        }

        return { id: voucherId, voucherNumber };
      }),
  }),

  // ============ Journal Entries ============
  journalEntries: router({
    list: protectedProcedure
      .input(z.object({ branchId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllJournalEntries(input?.branchId);
      }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getJournalEntryById(input);
    }),
    getLines: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getJournalEntryLines(input);
    }),
    create: protectedProcedure
      .input(
        z.object({
          date: z.string().or(z.date()),
          description: z.string(),
          branchId: z.number(),
          lines: z.array(
            z.object({
              accountId: z.number(),
              type: z.enum(["debit", "credit"]),
              amount: z.number().positive(),
              currencyId: z.number(),
              description: z.string().optional(),
            })
          ).min(2, "يجب إضافة سطرين على الأقل"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Validate balance (debit = credit)
        const debitTotal = input.lines
          .filter((l) => l.type === "debit")
          .reduce((sum, l) => sum + l.amount, 0);
        const creditTotal = input.lines
          .filter((l) => l.type === "credit")
          .reduce((sum, l) => sum + l.amount, 0);

        if (Math.abs(debitTotal - creditTotal) > 0.01) {
          throw new Error(
            `القيد غير متوازن: المدين = ${debitTotal.toFixed(2)}, الدائن = ${creditTotal.toFixed(2)}`
          );
        }

        // Generate entry number
        const timestamp = Date.now();
        const entryNumber = `JE-${timestamp}`;

        // Create journal entry
        const entryId = await db.createJournalEntry(
          {
            entryNumber,
            date: new Date(input.date),
            description: input.description,
            branchId: input.branchId,
            status: "posted",
            createdBy: ctx.user.id,
          },
          input.lines as any
        );

        return { id: entryId, entryNumber };
      }),
  }),

  // ============ Units ============
  units: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllUnits();
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getUnitById(input);
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          code: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createUnit({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        await db.updateUnit(id, updateData);
        return { success: true };
      }),
    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      await db.deleteUnit(input);
      return { success: true };
    }),
  }),

  // ============ Organizations ============
  organizations: router({
    list: protectedProcedure
      .input(z.object({ unitId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllOrganizations(input?.unitId);
      }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getOrganizationById(input);
    }),
    create: protectedProcedure
      .input(
        z.object({
          unitId: z.number(),
          name: z.string(),
          code: z.string(),
          taxNumber: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createOrganization({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          taxNumber: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        await db.updateOrganization(id, updateData);
        return { success: true };
      }),
    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      await db.deleteOrganization(input);
      return { success: true };
    }),
  }),

  // ============ AI Assistant ============
  ai: router({
    chat: protectedProcedure
      .input(
        z.object({
          message: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement AI chat logic
        const response = "سأقوم بمساعدتك في تنفيذ هذا الأمر قريبًا.";

        // Save conversation
        await db.saveAiConversation({
          userId: ctx.user.id,
          message: input.message,
          response,
          action: null,
          actionData: null,
        });

        return { response };
      }),
    conversations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAiConversations(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;

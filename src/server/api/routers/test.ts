import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const testRouter = createTRPCRouter({
  //   addressTestPublic: publicProcedure.query(({ ctx }) => {
  //     return ctx.session?.user.id;
  //   }),
  addressTestProtected: protectedProcedure.query(({ ctx }) => {
    return ctx.session?.user.id;
  }),
});

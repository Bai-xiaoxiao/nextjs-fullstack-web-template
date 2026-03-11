import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/better-auth";
import { getSession } from "@/server/better-auth/server";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getSession();

  if (session) {
    void api.post.getLatest.prefetch();
  }

  // useEffect(() => {
  //   setTimeout(async () => {
  //     const hello = await api.post.hello({ text: "from tRPC" });
  //     console.log(hello);
  //   }, 3000);
  // }, []);

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            创建 <span className="text-[hsl(280,100%,70%)]">T3</span> 应用
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">第一步 →</h3>
              <div className="text-lg">
                基础知识 - 您需要了解的所有内容，用于设置数据库和身份验证。
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">文档 →</h3>
              <div className="text-lg">
                了解有关 Create T3 App、它使用的库以及如何部署它的更多信息。
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "正在加载 tRPC 查询..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>已登录，用户为 {session.user?.name}</span>}
              </p>
              {!session ? (
                <form>
                  <button
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                    formAction={async () => {
                      "use server";
                      const res = await auth.api.signInSocial({
                        body: {
                          provider: "github",
                          callbackURL: "/",
                        },
                      });
                      if (!res.url) {
                        throw new Error("signInSocial 未返回 URL");
                      }
                      redirect(res.url);
                    }}
                  >
                    使用 Github 登录
                  </button>
                </form>
              ) : (
                <form>
                  <button
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                    formAction={async () => {
                      "use server";
                      await auth.api.signOut({
                        headers: await headers(),
                      });
                      redirect("/");
                    }}
                  >
                    退出登录
                  </button>
                </form>
              )}
            </div>
          </div>

          {session?.user && <LatestPost />}
        </div>
      </main>
    </HydrateClient>
  );
}

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/better-auth";
import { getSession } from "@/server/better-auth/server";
import { api, HydrateClient } from "@/trpc/server";
import { Button } from "antd";

export default async function Home() {
  // 使用trpc查询数据
  const hello = await api.post.hello({ text: "from tRPC" });
  // 用户登录注册授权类使用better-auth
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
          <div className="flex gap-10">
              <Button size="large" type="primary" href="/admin">管理端入口</Button>
              <Button size="large" type="primary" href="/user/sign-in">用户登录</Button>
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

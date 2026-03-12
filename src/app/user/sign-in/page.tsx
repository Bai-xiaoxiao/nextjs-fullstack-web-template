'use client';
import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  // 注册状态，可以拿到各种响应式的状态，成功和失败的状态也能拿到
  // 但是在下面的mutate中也可以执行成失败的回调
  const { isPending, mutate } = api.user.signIn.useMutation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    mutate({
      email,
      password,
      name,
    }, {
      onError: (err) => {
        console.dir(err, 123);
        alert(err.message || "注册失败");
      },
      onSuccess: () => {
        alert("注册成功");
      },
    })
 
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="w-full max-w-md px-4">
        <div className="rounded-xl bg-white/10 p-8 backdrop-blur-sm">
          <h1 className="mb-6 text-3xl font-bold text-center">注册</h1>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                姓名
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="请输入姓名"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                邮箱
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="请输入邮箱"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="请输入密码（至少6位）"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-white/10 py-3 font-semibold transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "注册中..." : "注册"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-white/70">已有账号？</span>{" "}
            <Link
              href="/sign-in"
              className="font-medium text-white transition hover:text-white/80"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-siyi-dark">404</h1>
      <p className="text-siyi-gray">页面不存在</p>
      <Link href="/" className="btn-siyi">
        返回首页
      </Link>
    </div>
  );
}

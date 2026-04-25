import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/* ── Hero background ── */
const HERO_BG =
  "https://d2x6zkkdzr5t9k.cloudfront.net/310519663308191654/KvErCdkHiKu9JCSirwCMH7/siyi-hero-bg-2rj6XLYXznofyUpoU7QzBJ.webp";

/* ── Stats ── */
const STATS = [
  { num: 20, suffix: "+", label: "年行业深耕", sub: "2004年至今" },
  { num: 3, suffix: "", label: "大业务板块", sub: "策划·运营·MCN" },
  { num: 3, suffix: "", label: "城市布局", sub: "厦门·福州·佛山" },
];

/* ── Business groups ── */
const BUSINESSES = [
  {
    index: "01",
    tag: "地产营销智库",
    name: "目标传达",
    fullName: "肆意股份·目标传达",
    year: "成立于2004年",
    desc: "国内最具资历的开发商品牌、房地产项目及城市更新策划营销顾问机构之一。二十多年来，与各个时代的头部房企并肩作战，提供从前期定位、策略顾问到营销全案推广的深度服务，用实战业绩说话。",
    color: "#1A1A1A",
    bg: "white",
    accent: "#249477",
    qr: "/images/siyi-qr-seg-miniprogram.png",
    link: "/target-convey.html",
  },
  {
    index: "02",
    tag: "文商旅品牌策划",
    name: "异外文化",
    fullName: "肆意股份·异外文化",
    year: "成立于2018年",
    desc: "福建区域领先的文商旅品牌策划机构。先后为漳州古城、泉州古城、国营厦门市第一农场等省内知名文旅及商业项目，提供精准的商业策划和咨询与IP全案落地服务，让空间焕发新的生命力。",
    color: "white",
    bg: "#249477",
    accent: "rgba(255,255,255,0.7)",
    qr: "/images/siyi-qr-yiwai.png",
    link: "https://cn.segxm.com/unknow",
  },
  {
    index: "03",
    tag: "独立商业全案运营",
    name: "超赞文旅",
    fullName: "肆意股份·超赞文旅",
    year: "异外文化孵化",
    desc: "专注于商业全案运营的独立机构。深度参与城市更新进程，为集美大明广场、市民广场、沙坡尾、厦门中心、园博苑inipark等重点项目提供市场顾问、招商及运营服务，致力于打造具有持久活力的城市新地标。",
    color: "#1A1A1A",
    bg: "#F5F5F5",
    accent: "#249477",
  },
];

/* ── MCN creators ── */
const MCN_CREATORS = [
  {
    name: "厦门购房内参",
    desc: "厦门本地最具影响力的购房指南类IP，30万+用户，2万+付费会员",
    tag: "国内领先的付费购房社群",
    qr: "/images/siyi-mcn-neican-logo.png",
  },
  {
    name: "好房评测局",
    desc: "独立第三方视角的项目价值解读，专业房产测评，理性购房参考",
    tag: "城市板块与楼盘营销智库",
    qr: "/images/siyi-mcn-haofang-qr.png",
  },
  {
    name: "羊羊超会讲",
    desc: "日曝光100W+的IP矩阵，新媒体IP矩阵达人",
    tag: "福建省头部探盘IP",
    qr: "/images/siyi-mcn-yangyang-qr.png",
  },
  {
    name: "丁叔猎房",
    desc: "楼盘百科，新型的短视频销售物料，好房研选系列",
    tag: "福州房产头部博主",
    qr: "/images/siyi-mcn-dingshu-qr.png",
  },
];

/* ── Cover platforms ── */
const PLATFORMS = ["微信", "抖音", "视频号", "小红书", "西瓜视频", "今日头条"];

/* ── Contact info ── */
const CONTACT_ITEMS = [
  { label: "电话", value: "18603053777" },
  { label: "总部", value: "厦门市集美区集杏海堤102号401室" },
  { label: "分公司", value: "福州 · 佛山" },
];

/* ── Nav links ── */
const NAV_LINKS = [
  { label: "关于我们", href: "#about" },
  { label: "业务板块", href: "#business" },
  { label: "地产MCN", href: "#mcn" },
  { label: "联系我们", href: "#contact" },
];

/* ────────────────────────── Helpers ────────────────────────── */

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl font-bold md:text-5xl" style={{ color: "inherit" }}>
      {count}
      {suffix}
    </div>
  );
}

function FadeIn({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`fade-in-up ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ────────────────────────── Page ────────────────────────── */

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="container flex items-center justify-between py-4">
          <img
            src="/images/siyi-logo-white.webp"
            alt="SEG"
            className="h-8 transition-all"
            style={{ filter: scrolled ? "brightness(0)" : "none" }}
          />
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm transition-colors hover:text-siyi-green"
                style={{ color: scrolled ? "#1A1A1A" : "#fff" }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="btn-siyi text-sm"
            >
              合作咨询
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="container relative z-10 pt-24">
          <div className="max-w-3xl">
            <p className="section-index mb-6" style={{ color: "#249477" }}>
              SUPER ENERGY GROUP · 肆意股份
            </p>
            <h1
              className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
              style={{ color: "white", fontFamily: "'Noto Serif SC', serif", letterSpacing: "-0.02em" }}
            >
              用「实效+专业」
              <br />
              提升城市品牌
              <br />
              重塑不动产价值
            </h1>
            <p
              className="mb-8 text-base leading-relaxed md:text-lg"
              style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.9" }}
            >
              国内领先的地产营销与商业运营服务机构
            </p>
            <p className="mb-10 text-sm tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
              扎根福建 · 总部厦门 · 辐射全国
            </p>
            <div className="flex items-center gap-4">
              <a href="#about" className="btn-siyi">
                了解肆意股份
              </a>
              <a
                href="#business"
                className="text-sm font-medium px-8 py-3.5 transition-all duration-300 hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.6)", color: "white", borderRadius: "2px", letterSpacing: "0.05em" }}
              >
                业务板块
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2 md:right-16">
          <span
            className="text-xs tracking-widest"
            style={{ color: "rgba(255,255,255,0.5)", writingMode: "vertical-rl" }}
          >
            SCROLL
          </span>
          <div className="h-12 w-px animate-pulse" style={{ backgroundColor: "#249477" }} />
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ backgroundColor: "#1A1A1A" }}>
        <div className="container py-8">
          <div className="flex flex-col divide-y divide-white/30 md:flex-row md:divide-x md:divide-y-0 md:gap-0">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center px-8 py-6 text-white md:w-1/3"
              >
                <div className="flex items-baseline gap-1">
                  <CountUp target={stat.num} suffix={stat.suffix} />
                </div>
                <p className="mt-1 text-sm font-medium tracking-wide">{stat.label}</p>
                <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 md:py-32">
        <div className="container">
          <FadeIn>
            <p className="section-index mb-4" style={{ color: "#249477" }}>
              01 / ABOUT
            </p>
            <h2 className="mb-12 text-3xl font-bold md:text-4xl lg:text-5xl" style={{ color: "#1A1A1A" }}>
              肆意股份
            </h2>
          </FadeIn>

          <div className="flex flex-col gap-16 lg:flex-row">
            <div className="flex-1">
              <FadeIn>
                <p className="mb-6 text-base leading-relaxed md:text-lg" style={{ lineHeight: "1.9" }}>
                  肆意股份是国内领先的地产营销与商业运营服务机构。我们扎根福建，总部位于厦门，并在福州、佛山设有分公司。多年来，我们始终走在行业前沿，自媒体市场占有率常年位居福建省前列。
                </p>
                <p className="text-base leading-relaxed" style={{ color: "#555", lineHeight: "2.0" }}>
                  我们深信，在存量时代，不动产的价值需要被重新定义。为此，我们构建了多个核心业务板块，为客户提供全链路的专业服务。
                </p>
              </FadeIn>
            </div>

            <div className="flex-1">
              <FadeIn>
                <div className="siyi-quote mb-6">
                  <p className="text-lg font-medium md:text-xl" style={{ lineHeight: "1.8" }}>
                    用流量、资本、再设计，帮助不动产实现保值增值与高效流通。
                  </p>
                </div>
                <p className="text-sm" style={{ color: "#888" }}>
                  国内领先的地产营销与商业运营服务机构
                </p>
              </FadeIn>
            </div>
          </div>

          {/* Space image */}
          <FadeIn className="mt-16">
            <div className="relative overflow-hidden" style={{ borderRadius: "2px" }}>
              <img
                src="/images/siyi-space-rendered.jpg"
                alt="肆意Space · 园博苑inipark"
                className="relative z-10 w-full object-cover"
                style={{ borderRadius: "2px", maxHeight: "520px" }}
                loading="lazy"
              />
              <div
                className="absolute bottom-4 left-4 z-20 px-3 py-1.5"
                style={{ backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "2px" }}
              >
                <span className="text-xs text-white opacity-80">肆意Space · 园博苑inipark</span>
              </div>
            </div>
          </FadeIn>

          {/* Key locations */}
          <FadeIn className="mt-12">
            <div className="flex flex-col gap-8 md:flex-row md:gap-16">
              {[
                { name: "肆意股份总部", img: "/images/siyi-space-new.jpg" },
                { name: "漳州古城", img: "/images/siyi-project-zhangzhou.webp" },
                { name: "异外文化", img: "/images/siyi-project-wuyuanwan.webp" },
              ].map((item) => (
                <div key={item.name} className="flex-1">
                  <div className="overflow-hidden" style={{ borderRadius: "2px" }}>
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full object-cover transition-transform duration-500 hover:scale-105"
                      style={{ height: "240px" }}
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-3 text-sm" style={{ color: "#888" }}>
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Business Segments ── */}
      <section id="business" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="container py-24 md:py-32">
          <FadeIn>
            <p className="section-index mb-4" style={{ color: "#249477" }}>
              BUSINESS SEGMENTS
            </p>
            <h2
              className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl"
              style={{ color: "white", fontFamily: "'Noto Serif SC', serif", letterSpacing: "-0.02em" }}
            >
              三大核心业务板块
            </h2>
          </FadeIn>

          <div className="mt-16 flex flex-col gap-1">
            {BUSINESSES.map((biz) => (
              <FadeIn key={biz.name}>
                <a
                  href={biz.link || "#"}
                  className="group block transition-all duration-300"
                  style={{ backgroundColor: biz.bg, borderRadius: "2px" }}
                >
                  <div className="flex flex-col gap-6 p-8 md:flex-row md:items-start md:gap-12 md:p-12">
                    {/* Left: index + tag */}
                    <div className="shrink-0 md:w-32">
                      <span
                        className="section-index"
                        style={{ color: biz.accent, fontSize: "2rem", fontWeight: 700 }}
                      >
                        {biz.index}
                      </span>
                      <p className="mt-2 text-xs tracking-widest" style={{ color: biz.accent }}>
                        {biz.tag}
                      </p>
                    </div>

                    {/* Middle: name + desc */}
                    <div className="flex-1">
                      <h3 className="mb-1 text-2xl font-bold md:text-3xl" style={{ color: biz.color }}>
                        {biz.name}
                      </h3>
                      <p className="mb-1 text-xs tracking-widest" style={{ color: biz.accent }}>
                        {biz.fullName}
                      </p>
                      <p className="mb-4 text-xs" style={{ color: biz.color === "white" ? "rgba(255,255,255,0.5)" : "#888" }}>
                        {biz.year}
                      </p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: biz.color === "white" ? "rgba(255,255,255,0.7)" : "#555",
                          lineHeight: "1.9",
                        }}
                      >
                        {biz.desc}
                      </p>
                    </div>

                    {/* Right: QR */}
                    <div className="shrink-0">
                      {biz.qr && (
                        <img
                          src={biz.qr}
                          alt={`${biz.name}二维码`}
                          className="h-24 w-24 object-contain opacity-70 transition-opacity group-hover:opacity-100"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── MCN ── */}
      <section id="mcn" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="container py-24 md:py-32">
          <FadeIn>
            <p className="section-index mb-4" style={{ color: "#249477" }}>
              03 / MCN
            </p>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl" style={{ color: "white" }}>
              国内领先的
            </h2>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl" style={{ color: "white" }}>
              <span style={{ color: "#249477" }}>地产MCN机构</span>
            </h2>
            <p
              className="mb-16 max-w-2xl text-base leading-relaxed md:text-lg"
              style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.9" }}
            >
              我们深谙流量密码，先后成功孵化了多个知名房产IP。用真实的声音、专业的内容，连接市场与用户，构建起强大的新媒体传播矩阵。自媒体市场占有率常年位居福建省前列。
            </p>
          </FadeIn>

          {/* Team photo */}
          <FadeIn className="mb-16" style={{ marginLeft: "-1.5rem", marginRight: "-1.5rem" }}>
            <div className="relative hidden overflow-hidden md:block" style={{ height: "820px" }}>
              <img
                src="/images/siyi-mcn-team-edited.png"
                alt="SEG肆意股份MCN团队"
                className="h-full w-full object-cover"
                style={{ objectPosition: "center bottom" }}
                loading="lazy"
              />
              <div className="absolute bottom-6 left-6 z-10">
                <p className="text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                  SEG MCN LAB · 地产大V梦工厂
                </p>
                <p className="text-sm font-medium text-white">TEAM · 我们的团队</p>
              </div>
            </div>
          </FadeIn>

          {/* Creator cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {MCN_CREATORS.map((creator) => (
              <FadeIn key={creator.name}>
                <div
                  className="p-6 transition-all duration-300"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "2px",
                  }}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white">{creator.name}</h4>
                      <p className="mt-1 text-xs tracking-widest" style={{ color: "#249477" }}>
                        {creator.tag}
                      </p>
                    </div>
                    <img
                      src={creator.qr}
                      alt={`${creator.name}二维码`}
                      className="h-16 w-16 shrink-0 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)", lineHeight: "1.8" }}>
                    {creator.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Cover platforms */}
          <FadeIn className="mt-16">
            <p className="mb-6 text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              覆盖平台：
            </p>
            <div className="flex flex-wrap gap-4">
              {PLATFORMS.map((p) => (
                <span
                  key={p}
                  className="px-4 py-2 text-sm"
                  style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "2px" }}
                >
                  {p}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Vision ── */}
      <section style={{ backgroundColor: "#0a0a0a" }}>
        <div className="container py-24 md:py-32">
          <FadeIn>
            <p className="section-index mb-4" style={{ color: "#249477" }}>
              OUR VISION · 我们的愿景
            </p>
            <h2
              className="mb-6 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Noto Serif SC', serif", letterSpacing: "-0.02em" }}
            >
              用流量、资本、再设计
            </h2>
            <h2
              className="mb-8 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Noto Serif SC', serif", letterSpacing: "-0.02em" }}
            >
              帮助不动产保值增值与高效流通
            </h2>
            <p className="mb-12 max-w-2xl text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.5)", lineHeight: "2.0" }}>
              在存量时代，我们相信不动产的价值需要被重新定义。
              <br />
              这是肆意股份二十年来不变的信念，也是我们每天在做的事。
            </p>
            <a href="#contact" className="btn-siyi">
              开始合作
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 md:py-32">
        <div className="container">
          <div className="flex flex-col gap-16 lg:flex-row">
            <div className="flex-1">
              <FadeIn>
                <p className="section-index mb-4" style={{ color: "#249477" }}>
                  05 / CONTACT
                </p>
                <h2 className="mb-4 text-3xl font-bold md:text-4xl" style={{ color: "#1A1A1A" }}>
                  开始合作
                </h2>
                <p className="mb-12 text-base leading-relaxed" style={{ color: "#555", lineHeight: "2.0", maxWidth: "480px" }}>
                  无论您是政府职能部门、开发商、商业项目方，还是希望在地产自媒体领域有所作为，我们都期待与您深入探讨合作的可能性。
                </p>

                {/* Green line */}
                <div style={{ height: "3px", backgroundColor: "#249477", marginBottom: "0" }} />

                {/* Contact details */}
                <div className="flex flex-col">
                  {CONTACT_ITEMS.map((item) => (
                    <div key={item.label} className="flex items-center gap-8 py-6" style={{ borderBottom: "1px solid #eee" }}>
                      <span
                        className="shrink-0 text-xs tracking-widest"
                        style={{ color: "#249477", fontFamily: "'Space Grotesk', monospace", width: "52px" }}
                      >
                        {item.label}
                      </span>
                      <span className="text-base" style={{ color: "#1A1A1A" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <div className="flex-1">
              <FadeIn>
                <div className="flex flex-col items-center">
                  <p className="mb-4 text-sm font-medium" style={{ color: "#1A1A1A" }}>
                    联系二维码
                  </p>
                  <img
                    src="/images/siyi-contact-wechat-qr.png"
                    alt="联系二维码"
                    className="mb-3"
                    style={{ width: "180px", height: "180px" }}
                    loading="lazy"
                  />
                  <p className="text-xs" style={{ color: "#888" }}>
                    扫码联系我们
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "#249477" }}>
                    微信扫码
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "#888" }}>
                    了解更多合作详情
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: "#0a0a0a" }}>
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <img
                src="/images/siyi-icon.jpg"
                alt="肆意股份"
                className="h-7 w-7 rounded-sm object-cover opacity-80"
              />
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                © 2025 肆意股份 Super Energy Group. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xs transition-colors duration-300 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

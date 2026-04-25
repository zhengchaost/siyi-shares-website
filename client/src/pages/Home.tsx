import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const HERO_BG = "https://d2x6zkkdzr5t9k.cloudfront.net/siyi-hero-bg.jpg";

const STATS = [
  { label: "签约博主", value: 200, suffix: "+" },
  { label: "全网粉丝", value: 5000, suffix: "万+" },
  { label: "合作品牌", value: 100, suffix: "+" },
  { label: "覆盖城市", value: 30, suffix: "+" },
];

const BUSINESSES = [
  {
    name: "目标传达",
    nameEn: "Target Convey",
    desc: "地产营销全链路服务商，从策略到执行一站式解决方案",
    href: "/target-convey.html",
  },
  {
    name: "异外文化",
    nameEn: "Yiwai Culture",
    desc: "新锐内容创作团队，打造年轻化地产内容生态",
    href: "https://cn.segxm.com/unknow",
  },
  {
    name: "超赞文旅",
    nameEn: "Chaozan Travel",
    desc: "文旅项目运营专家，赋能目的地体验升级",
    href: "#",
  },
];

const MCN_CREATORS = [
  { name: "顶墅", qr: "/images/siyi-mcn-dingshu-qr.png" },
  { name: "好房评测局", qr: "/images/siyi-mcn-haofang-qr.png" },
  { name: "内参", qr: "/images/siyi-mcn-neican-logo.png" },
  { name: "洋洋", qr: "/images/siyi-mcn-yangyang-qr.png" },
];

const PROJECTS = [
  { name: "环东", img: "/images/siyi-project-huandong.jpg" },
  { name: "园博苑 inipark", img: "/images/siyi-project-inipark.jpg" },
  { name: "刘霞", img: "/images/siyi-project-liuxia.jpg" },
  { name: "五缘湾", img: "/images/siyi-project-wuyuanwan.webp" },
  { name: "漳州", img: "/images/siyi-project-zhangzhou.webp" },
];

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
    <div ref={ref} className="text-4xl font-bold text-siyi-green md:text-5xl">
      {count}
      {suffix}
    </div>
  );
}

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      ref.current.querySelectorAll(".fade-in-up").forEach((el) => {
        observer.observe(el);
      });
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const sectionRef = useFadeIn();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen bg-white">
      {/* Navbar */}
      <nav
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-4 md:px-16">
          <img
            src="/images/siyi-logo-white.webp"
            alt="SEG"
            className={`h-8 transition-all ${scrolled ? "brightness-0" : ""}`}
          />
          <div className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm text-siyi-dark hover:text-siyi-green">关于我们</a>
            <a href="#business" className="text-sm text-siyi-dark hover:text-siyi-green">事业群</a>
            <a href="#mcn" className="text-sm text-siyi-dark hover:text-siyi-green">MCN</a>
            <a href="#projects" className="text-sm text-siyi-dark hover:text-siyi-green">项目案例</a>
            <Button className="btn-siyi text-sm">联系我们</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white">
          <div className="mx-auto mb-6 h-px w-24 bg-amber-400" />
          <h1 className="mb-4 text-5xl font-bold leading-tight md:text-7xl">
            肆意股份
          </h1>
          <p className="mb-8 text-lg tracking-widest md:text-xl">
            SIYI SHARES GROUP
          </p>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            福建头部地产MCN · 三大事业群协同驱动
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-8 px-8 md:grid-cols-4 md:px-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center fade-in-up">
              <CountUp target={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm text-siyi-gray">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-siyi-light-gray py-24">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-16 px-8 md:flex-row md:px-16">
          <div className="flex-1 fade-in-up">
            <p className="section-index mb-4 text-sm tracking-widest text-siyi-green">
              01 / ABOUT
            </p>
            <h2 className="mb-6 text-3xl font-bold text-siyi-dark md:text-4xl">
              关于我们
            </h2>
            <div className="siyi-quote mb-6 text-base leading-relaxed text-siyi-gray md:text-lg">
              <p>
                肆意股份是福建头部地产MCN公司，旗下设目标传达、异外文化、超赞文旅三大事业群，
                覆盖地产营销、内容创作、文旅运营全链路服务。
              </p>
            </div>
            <p className="text-sm text-siyi-gray">
              公司深耕地产赛道，以内容驱动增长，以创意赋能品牌，致力于成为地产内容生态的领航者。
            </p>
          </div>
          <div className="flex-1 fade-in-up">
            <img
              src="/images/siyi-group-photo-hd.webp"
              alt="团队合照"
              className="w-full rounded shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Business Groups */}
      <section id="business" className="py-24">
        <div className="mx-auto max-w-[1440px] px-8 md:px-16">
          <p className="section-index mb-4 text-sm tracking-widest text-siyi-green">
            02 / BUSINESS
          </p>
          <h2 className="mb-12 text-3xl font-bold text-siyi-dark md:text-4xl">
            三大事业群
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {BUSINESSES.map((biz) => (
              <a
                key={biz.name}
                href={biz.href}
                className="group fade-in-up block rounded border border-siyi-light-gray p-8 transition-all hover:border-siyi-green hover:shadow-lg"
              >
                <h3 className="mb-1 text-2xl font-bold text-siyi-dark">
                  {biz.name}
                </h3>
                <p className="mb-4 text-xs tracking-widest text-siyi-gray">
                  {biz.nameEn}
                </p>
                <p className="text-sm leading-relaxed text-siyi-gray">
                  {biz.desc}
                </p>
                <div className="mt-6 text-sm font-medium text-siyi-green opacity-0 transition-opacity group-hover:opacity-100">
                  了解更多 →
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* MCN */}
      <section id="mcn" className="bg-siyi-light-gray py-24">
        <div className="mx-auto max-w-[1440px] px-8 md:px-16">
          <p className="section-index mb-4 text-sm tracking-widest text-siyi-green">
            03 / MCN
          </p>
          <h2 className="mb-12 text-3xl font-bold text-siyi-dark md:text-4xl">
            地产MCN矩阵
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {MCN_CREATORS.map((creator) => (
              <div
                key={creator.name}
                className="fade-in-up rounded bg-white p-6 text-center shadow-sm"
              >
                <img
                  src={creator.qr}
                  alt={creator.name}
                  className="mx-auto mb-4 h-32 w-32 object-contain"
                  loading="lazy"
                />
                <p className="font-medium text-siyi-dark">{creator.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 fade-in-up text-center">
            <img
              src="/images/siyi-mcn-team-edited.png"
              alt="MCN团队"
              className="mx-auto max-w-3xl rounded shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-24">
        <div className="mx-auto max-w-[1440px] px-8 md:px-16">
          <p className="section-index mb-4 text-sm tracking-widest text-siyi-green">
            04 / PROJECTS
          </p>
          <h2 className="mb-12 text-3xl font-bold text-siyi-dark md:text-4xl">
            项目案例
          </h2>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {PROJECTS.map((project) => (
              <div
                key={project.name}
                className="group fade-in-up relative overflow-hidden rounded"
              >
                <img
                  src={project.img}
                  alt={project.name}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="p-4 text-sm font-medium text-white">
                    {project.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-siyi-dark py-24 text-white">
        <div className="mx-auto max-w-[1440px] px-8 md:px-16">
          <p className="section-index mb-4 text-sm tracking-widest text-siyi-green">
            05 / CONTACT
          </p>
          <h2 className="mb-12 text-3xl font-bold md:text-4xl">联系我们</h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="fade-in-up">
              <p className="mb-2 text-sm text-white/60">联系电话</p>
              <p className="text-xl font-medium">0592-5735983</p>
            </div>
            <div className="fade-in-up">
              <p className="mb-2 text-sm text-white/60">微信联系</p>
              <img
                src="/images/siyi-contact-wechat-qr.png"
                alt="微信二维码"
                className="h-32 w-32"
                loading="lazy"
              />
            </div>
            <div className="fade-in-up">
              <p className="mb-2 text-sm text-white/60">公司地址</p>
              <p className="text-base leading-relaxed">
                厦门市集美区集杏海堤路102号401室
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-siyi-green-dark py-8 text-center text-sm text-white/70">
        <p>© {new Date().getFullYear()} 肆意股份 SIYI SHARES GROUP. All rights reserved.</p>
        <p className="mt-1">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            闽ICP备XXXXXXXX号
          </a>
        </p>
      </footer>
    </div>
  );
}

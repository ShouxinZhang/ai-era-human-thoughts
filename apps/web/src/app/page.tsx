import { MessageSquare, Code, ShieldAlert, Cpu } from "lucide-react";
import SubmitChallenge from "@/components/SubmitChallenge";
import ChallengeList from "@/components/ChallengeList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <header className="max-w-5xl mx-auto pt-24 pb-16 px-6 text-center sm:text-left">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          AI Era <span className="text-blue-600 dark:text-blue-400">Human Thoughts</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          一个名为“AI时代习题集”的平台。我们系统化地收集公众的焦虑与看法，以及开发者面临的技术挑战。
          就像一道道未解的数学习题，等待着时代的解答。
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20">
            浏览“习题集”
          </button>
          <SubmitChallenge />
        </div>
      </header>


      {/* Categories Grid */}
      <main className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Public Sector */}
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-4">公众领域 (Public)</h2>
            <p className="text-gray-600 dark:text-zinc-400 mb-6">
              关注就业冲击、社会道德、数据隐私以及人性在人工智能时代的重构。
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <ShieldAlert size={16} className="text-red-500" /> 就业替代与职业转型
              </li>
              <li className="flex items-center gap-3 text-sm">
                <ShieldAlert size={16} className="text-red-500" /> 算法歧视与道德伦理
              </li>
              <li className="flex items-center gap-3 text-sm">
                <ShieldAlert size={16} className="text-red-500" /> 信息安全与深度伪造
              </li>
            </ul>
          </div>

          {/* Developer Sector */}
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
              <Code size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-4">技术领域 (Developer)</h2>
            <p className="text-gray-600 dark:text-zinc-400 mb-6">
              开发者在模型训练、工程落地及技术伦理中遇到的具体瓶颈。
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Cpu size={16} className="text-purple-500" /> 算力分配与效率优化
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Cpu size={16} className="text-purple-500" /> 幻觉（Hallucinations）治理
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Cpu size={16} className="text-purple-500" /> 提示词工程的工程化边界
              </li>
            </ul>
          </div>
        </div>

        {/* Real-time Challenge List */}
        <section id="list">
          <ChallengeList />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-zinc-900 py-12 text-center text-sm text-gray-500">
        <p>© 2026 AI Era Human Thoughts. Built for the community, by the community.</p>
      </footer>
    </div>
  );
}



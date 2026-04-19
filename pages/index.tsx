"use client"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">

            {/* Navigation */}
            <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🍳</span>
                    <span className="text-xl font-bold text-white">Chef Nova</span>
                </div>
                <div>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors duration-200">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <div className="flex items-center gap-4">
                            <Link href="/product">
                                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors duration-200">
                                    Open App
                                </button>
                            </Link>
                            <UserButton showName={true} />
                        </div>
                    </SignedIn>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-8 py-24 text-center">
                <div className="text-6xl mb-6">🥗</div>
                <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                    Your Personal
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> AI Chef</span>
                    <br />& Nutrition Coach
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    Tell Chef Nova what you want to cook. Get a personalized recipe, full nutrition breakdown, and expert tips — tailored to your diet, skill level, and health goals.
                </p>
                <div className="flex gap-4 justify-center">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors duration-200">
                                🚀 Start Cooking Free
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/product">
                            <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors duration-200">
                                🍽️ Open Chef Nova
                            </button>
                        </Link>
                    </SignedIn>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-8 py-16">
                <h2 className="text-3xl font-bold text-white text-center mb-12">
                    Everything you need to cook smarter
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-xl font-bold text-white mb-2">Personalized Recipes</h3>
                        <p className="text-gray-400">
                            Get complete recipes tailored to your dietary restrictions, skill level, and available time. No more generic suggestions.
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="text-4xl mb-4">🥦</div>
                        <h3 className="text-xl font-bold text-white mb-2">Nutrition Breakdown</h3>
                        <p className="text-gray-400">
                            Understand exactly what you are eating — calories, macros, key vitamins, and how each meal supports your specific health goal.
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="text-4xl mb-4">👨‍🍳</div>
                        <h3 className="text-xl font-bold text-white mb-2">Expert Chef Tips</h3>
                        <p className="text-gray-400">
                            Get pro cooking tips and smart substitutions for every recipe — so you can cook with confidence no matter your experience level.
                        </p>
                    </div>

                </div>
            </section>

            {/* Pricing Section */}
            <section className="container mx-auto px-8 py-16">
                <h2 className="text-3xl font-bold text-white text-center mb-12">
                    Simple, honest pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                        <p className="text-4xl font-bold text-white mb-4">$0<span className="text-lg text-gray-400">/mo</span></p>
                        <ul className="text-gray-400 space-y-2 mb-6">
                            <li>✅ Sign in with Google or GitHub</li>
                            <li>✅ View the app interface</li>
                            <li>❌ AI recipe generation locked</li>
                            <li>❌ Nutrition analysis locked</li>
                        </ul>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors">
                                    Get Started Free
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-8 border-2 border-green-500 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                            POPULAR
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
                        <p className="text-4xl font-bold text-white mb-4">$9<span className="text-lg text-gray-400">/mo</span></p>
                        <ul className="text-gray-400 space-y-2 mb-6">
                            <li>✅ Unlimited recipe generation</li>
                            <li>✅ Full nutrition breakdowns</li>
                            <li>✅ Expert chef tips & variations</li>
                            <li>✅ All dietary restrictions supported</li>
                        </ul>
                        <Link href="/product">
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors">
                                Start Premium
                            </button>
                        </Link>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-8 text-gray-500 border-t border-gray-700 mt-8">
                <p>© 2026 Chef Nova · Built with Next.js, FastAPI & OpenAI</p>
            </footer>

        </main>
    );
}
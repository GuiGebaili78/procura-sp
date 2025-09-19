import React from "react";
import Link from "next/link";
import { LinkButton } from "../ui/LinkButton";

export function Header() {
  return (
    <header className="bg-card/95 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-dark-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 21V9.5L12 4.5L5 9.5V21H8V14H16V21H19ZM21 21V10L12 3L3 10V21H10V16H14V21H21Z" />
                <rect x="7" y="11" width="2" height="2" />
                <rect x="10" y="11" width="2" height="2" />
                <rect x="15" y="11" width="2" height="2" />
                <rect x="7" y="8" width="2" height="2" />
                <rect x="10" y="8" width="2" height="2" />
                <rect x="15" y="8" width="2" height="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Procura SP
              </h1>
              <p className="text-xs text-text-secondary -mt-1">Serviços Públicos</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/servicos"
              className="text-dark-secondary hover:text-accent transition-colors duration-200 font-medium"
            >
              Serviços
            </Link>
            <Link
              href="/sobre"
              className="text-dark-secondary hover:text-accent transition-colors duration-200 font-medium"
            >
              Sobre
            </Link>
            <LinkButton href="/contato" variant="primary" size="md">
              Contato
            </LinkButton>
          </nav>

          {/* Menu mobile */}
          <button className="md:hidden p-2 text-dark-secondary hover:text-accent transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

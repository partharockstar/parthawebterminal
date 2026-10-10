import React from 'react';

interface CodeHighlighterProps {
  code: string;
}

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ code }) => {
  const lines = code.split('\n');

  // Simple token parser for Userscript Javascript
  const renderLine = (line: string, lineIndex: number) => {
    // If it's a UserScript metadata header line
    if (line.trim().startsWith('// ==UserScript==') || line.trim().startsWith('// ==/UserScript==')) {
      return (
        <span key={lineIndex} className="text-amber-400 font-semibold">
          {line}
        </span>
      );
    }

    if (line.trim().startsWith('// @')) {
      const match = line.match(/^(\s*\/\/\s*@\w+)(\s+)(.*)$/);
      if (match) {
        return (
          <span key={lineIndex}>
            <span className="text-emerald-400 font-semibold">{match[1]}</span>
            <span>{match[2]}</span>
            <span className="text-cyan-300">{match[3]}</span>
          </span>
        );
      }
    }

    // Comment line
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return (
        <span key={lineIndex} className="text-slate-500 italic">
          {line}
        </span>
      );
    }

    // Tokenize strings, keywords, numbers
    // We can do a lightweight regex replacement with styled spans
    const tokens: React.ReactNode[] = [];
    const regex = /(["'`].*?["'`])|(\b(?:function|const|let|var|return|if|else|for|while|try|catch|new|async|await|typeof|instanceof)\b)|(\b(?:document|window|console|GM_addStyle|GM_setValue|GM_getValue|MutationObserver|querySelector|querySelectorAll|addEventListener|setTimeout|setInterval)\b)|(\b\d+\b)|(\/\/[^\n]*)/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(line.substring(lastIndex, match.index));
      }

      if (match[1]) {
        // String literal
        tokens.push(
          <span key={`${lineIndex}-${match.index}`} className="text-emerald-300">
            {match[1]}
          </span>
        );
      } else if (match[2]) {
        // Keyword
        tokens.push(
          <span key={`${lineIndex}-${match.index}`} className="text-purple-400 font-medium">
            {match[2]}
          </span>
        );
      } else if (match[3]) {
        // Builtin / API
        tokens.push(
          <span key={`${lineIndex}-${match.index}`} className="text-sky-300 font-medium">
            {match[3]}
          </span>
        );
      } else if (match[4]) {
        // Number
        tokens.push(
          <span key={`${lineIndex}-${match.index}`} className="text-amber-300">
            {match[4]}
          </span>
        );
      } else if (match[5]) {
        // Inline comment
        tokens.push(
          <span key={`${lineIndex}-${match.index}`} className="text-slate-500 italic">
            {match[5]}
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push(line.substring(lastIndex));
    }

    return <span key={lineIndex}>{tokens.length > 0 ? tokens : line}</span>;
  };

  return (
    <div className="font-mono text-[13px] leading-relaxed select-text overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
              <td className="w-12 pr-4 text-right select-none text-slate-600 font-mono text-xs align-top pt-0.5">
                {idx + 1}
              </td>
              <td className="whitespace-pre text-slate-200 align-top">
                {renderLine(line, idx)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

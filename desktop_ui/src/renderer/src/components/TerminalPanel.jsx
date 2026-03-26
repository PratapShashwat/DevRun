import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function TerminalPanel({ projectName }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const currentLine = useRef(''); 

  useEffect(() => {
    const term = new Terminal({
      theme: { background: '#1e1e1e', foreground: '#d4d4d4', cursor: '#58a6ff' },
      cursorBlink: true,
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: 14,
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    
    const printPrompt = () => {
      term.write('\r\n\x1b[1;32mroot@sandbox\x1b[0m:\x1b[1;34m/workspace\x1b[0m$ ');
    };

    term.writeln(`\x1b[1;32m[Connected] Secure Tunnel Established to: ${projectName}\x1b[0m`);
    printPrompt();

    
    term.onData((data) => {
      const code = data.charCodeAt(0);
      
      if (code === 13) { 
        const command = currentLine.current.trim();
        term.write('\r\n'); // Move to next line
        
        if (command) {
          
          window.api.sendTerminalInput({ projectName, command });
        } else {
          printPrompt(); 
        }
        currentLine.current = ''; 
        
      } else if (code === 127) { 
        if (currentLine.current.length > 0) {
          currentLine.current = currentLine.current.slice(0, -1);
          term.write('\b \b'); // Erase character from the UI
        }
      } else { 
        currentLine.current += data;
        term.write(data);
      }
    });

    const removeListener = window.api.onTerminalOutput((output) => {
      
      const cleanOutput = output.replace(/\n/g, '\r\n');
      term.write(cleanOutput);
      printPrompt();
    });

    return () => {
      removeListener();
      term.dispose();
    };
  }, [projectName]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#161b22', padding: '6px 15px', fontSize: '0.8rem', color: '#8b949e', borderBottom: '1px solid #30363d', borderTop: '1px solid #30363d' }}>
        >_ Terminal
      </div>
      <div ref={terminalRef} style={{ flexGrow: 1, width: '100%', padding: '10px', backgroundColor: '#1e1e1e', overflow: 'hidden' }} />
    </div>
  );
}
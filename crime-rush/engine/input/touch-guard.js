// Shared mobile selection guard. Do not cancel pointer/touch events, scrolling, or editing.
(()=>{if(window.CrimeRushTouchGuard)return;window.CrimeRushTouchGuard=true;
 const touch=()=>matchMedia('(any-pointer:coarse), (hover:none)').matches;
 const selector='input:not([type]),input[type="text"],input[type="search"],input[type="email"],input[type="password"],input[type="tel"],input[type="url"],input[type="number"],textarea,[data-selectable]';
 const editable=node=>{const el=node instanceof Element?node:node?.parentElement;return !!(el&&(el.isContentEditable||el.closest(selector)));};
 for(const name of ['selectstart','contextmenu','dragstart'])document.addEventListener(name,e=>{if(touch()&&!editable(e.target))e.preventDefault();},true);
 document.addEventListener('selectionchange',()=>{if(!touch())return;const s=window.getSelection();if(s&&!s.isCollapsed&&!editable(s.anchorNode)&&!editable(s.focusNode))s.removeAllRanges();});
 document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!editable(e.target)){const s=window.getSelection();if(s&&!s.isCollapsed&&!editable(s.anchorNode)&&!editable(s.focusNode))s.removeAllRanges();}},true);
})();

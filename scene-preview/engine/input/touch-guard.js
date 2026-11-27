
(()=>{
 const touch=()=>matchMedia('(any-pointer:coarse), (hover:none)').matches;
 const editable=e=>e.target instanceof Element&&!!e.target.closest('input:not([type]),input[type="text"],input[type="search"],input[type="email"],input[type="password"],input[type="tel"],input[type="url"],input[type="number"],textarea,[contenteditable="true"],[contenteditable="plaintext-only"]');
 for(const name of ['selectstart','contextmenu','dragstart'])document.addEventListener(name,e=>{if(touch()&&!editable(e))e.preventDefault();},true);
})();

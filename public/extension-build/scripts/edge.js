function callBack(e){console.log("----------------------------------------------------\x3e>>"),console.log("==========>>>",{mutations:e}),createLink()}var parentSelector="div.UXx3I";function createLink(){console.log("=========================================");const e=document.querySelector(parentSelector);if(console.log(e?"IMA parent":"NEMA parent"),!e||e.classList.contains("question-finder"))return;const t=e.querySelector("span.full.UAxMv");if(!t)return;console.log("subject",t);const n=document.querySelector("span.OZZZK").textContent;console.log({spanText:n});const o=n.match(/<(.+?)>/).pop();if(e.querySelector("div.xyz.vmaKW.kyCyq"))return void console.log("Already added");const c=document.createElement("div");c.classList.add("xyz","vmaKW","kyCyq");const s=document.createElement("img");s.src=chrome.runtime.getURL("/images/support.ico");const l=document.createElement("span");l.innerHTML="<i>Support</i>";const r=document.createElement("a");r.appendChild(s),r.appendChild(l),r.classList.add("question-finder"),r.style.marginLeft="5px",r.style.fontSize="14px",r.addEventListener("click",(t=>{const n=e.querySelector("span.full.UAxMv").textContent;console.log("subject click",n);const c={source:"2",eventName:"find-question",subject:n,email:o},s=chrome.runtime.sendMessage(c);console.log("found question: ",s),t.stopPropagation()})),c.appendChild(r),e.appendChild(c),console.log("DODAO TRECI DIV"),e.classList.add("question-finder");new MutationObserver(callBack).observe(document.querySelector("div.g_zET"),{childList:!0,subtree:!0})}setTimeout(createLink,2e3);
const links = document.querySelectorAll(".menu ul a");
 
for (const link of links) {
  link.addEventListener("click", clickHandler);
}
 
function clickHandler(e) {
  e.preventDefault();
  for (const link of links) {
      link.classList.remove("activo");
  }
  e.target.classList.add("activo");
  
  const href = this.getAttribute("href");
  const offsetTop = document.querySelector(href).offsetTop;
 
  scroll({
    top: offsetTop,
    behavior: "smooth"
  });
}

window.onscroll = function() {
    const top = window.pageYOffset;
    

    for (const link of links) {
        
        const offsetTop = document.querySelector(link.getAttribute("href")).offsetTop - 300;
        if(offsetTop <= top){
            for (const link2 of links) link2.classList.remove("activo");
            link.classList.add("activo");
        }
        
    }
};
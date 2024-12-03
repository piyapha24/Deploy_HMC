const linkSidMenu = document.querySelectorAll(".side-menu")

console.log(linkSidMenu);

linkSidMenu.forEach((item) => {
    item.addEventListener('click', () => {
        linkSidMenu.forEach((li) => {
            li.classList.remove('side-menu--active')
        })

        item.classList.add('side-menu--active')
    })
})

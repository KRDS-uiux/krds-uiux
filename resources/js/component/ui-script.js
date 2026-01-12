"use strict";

// 윈도우 사이즈 체크
const windowSize = {
  winSize: null,
  breakPoint: 1024,

  setWinSize() {
    this.winSize = window.innerWidth >= this.breakPoint ? "pc" : "mob";
  },

  getWinSize() {
    return this.winSize;
  },
};

// 스크롤 방향 체크
const scrollManager = {
  _scrollY: 0,
  _scrollH: 0,
  _lastScrollY: 0,

  updateScrollValues() {
    this._scrollY = window.scrollY;
    this._scrollH = document.body.scrollHeight;
  },

  handleScrollDirection() {
    const $wrap = document.querySelector("#wrap");
    if ($wrap) {
      const _conOffsetTop = document.querySelector("#container").offsetTop;
      const _scrollY = window.scrollY;
      const _scrollDown = _scrollY > this._lastScrollY;
      const _scrollUp = _scrollY < this._lastScrollY;

      if (_scrollY > _conOffsetTop + 50 && _scrollDown) {
        $wrap.classList.add("scroll-down");
        $wrap.classList.remove("scroll-up");
      } else if (_scrollY > _conOffsetTop + 50 && _scrollUp) {
        $wrap.classList.add("scroll-up");
        $wrap.classList.remove("scroll-down");
      } else {
        $wrap.classList.remove("scroll-down", "scroll-up");
      }

      this._lastScrollY = _scrollY;
    }
  },

  getscrollY() {
    return this._scrollY;
  },

  getScrollH() {
    return this._scrollH;
  },
};

// common
const common = {
  focusTrap(trap) {
    const focusableElements = trap.querySelectorAll(`a, button, [tabindex="0"], input, textarea, select`);

    if (!focusableElements.length) return;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    trap.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
          // 모달 오픈 후 첫 초점 역방향 제어(modal-content가 첫초점이 아니면 사용 안해도 됨)
        } else if (event.key === "Tab" && event.shiftKey && document.activeElement === trap) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      }
    });
  },
};

/*** * krds_mainMenuPC * ***/
const krds_mainMenuPC = {
  init() {
    const gnbMenu = document.querySelector(".krds-main-menu:not(.sample) .gnb-menu");

    if (!gnbMenu) return;

    // gnb 속성설정
    gnbMenu.setAttribute("aria-label", "메인 메뉴");

    // dimed 요소를 설정, 기존 dimed가 없을 경우 생성
    this.backdrop = document.querySelector(".gnb-backdrop") || this.createBackdrop();

    // 주 메뉴 및 서브 메뉴의 트리거를 설정하고, 각 트리거에 이벤트를 연결
    const mainTriggers = gnbMenu.querySelectorAll(".gnb-main-trigger");
    const subTriggers = gnbMenu.querySelectorAll(".gnb-sub-trigger:not(.is-link)");
    mainTriggers.forEach((mainTrigger) => this.setupMainTrigger(mainTrigger));
    this.attachEvents(mainTriggers, subTriggers);
    this.setupKeyboardNavigation(mainTriggers);
  },
  setupMainTrigger(mainTrigger) {
    const toggleWrap = mainTrigger.nextElementSibling;
    if (toggleWrap) {
      const uniqueIdx = `gnb-main-menu-${Math.random().toString(36).substring(2, 9)}`;
      mainTrigger.setAttribute("aria-controls", uniqueIdx);
      mainTrigger.setAttribute("aria-expanded", "false");
      mainTrigger.setAttribute("aria-haspopup", "true");
      toggleWrap.setAttribute("id", uniqueIdx);

      // 하위 메뉴 설정
      const mainList = toggleWrap.querySelector(".gnb-main-list");
      if (mainList?.getAttribute("data-has-submenu") === "true") {
        const subTriggers = mainList.querySelectorAll(".gnb-sub-trigger");
        subTriggers.forEach((subTrigger) => this.setupSubTrigger(subTrigger));
        if (subTriggers.length > 0 && !subTriggers[0].classList.contains("is-link")) {
          subTriggers[0].classList.add("active");
          subTriggers[0].setAttribute("aria-expanded", "true");
          subTriggers[0].nextElementSibling?.classList.add("active");
        }
      }
    }
  },
  setupSubTrigger(subTrigger) {
    const hasMenu = subTrigger.nextElementSibling;
    if (hasMenu) {
      const uniqueIdx = `gnb-sub-menu-${Math.random().toString(36).substring(2, 9)}`;
      subTrigger.setAttribute("aria-controls", uniqueIdx);
      subTrigger.setAttribute("aria-expanded", "false");
      subTrigger.setAttribute("aria-haspopup", "true");
      hasMenu.setAttribute("id", uniqueIdx);
    }
  },
  toggleMainMenu(mainTrigger) {
    const isActive = mainTrigger.classList.contains("active");
    const isDropDown = mainTrigger.classList.contains("is-dropdown");
    if (!isActive && mainTrigger.nextElementSibling) {
      this.resetMainMenu();
      mainTrigger.setAttribute("aria-expanded", "true");
      mainTrigger.classList.add("active");
      mainTrigger.nextElementSibling.classList.add("is-open");
      if (!isDropDown) {
        this.toggleBackdrop(true);
        this.toggleScrollbar(true);
        this.adjustSubMenuHeight(mainTrigger.nextElementSibling.querySelector(".gnb-main-list"));
      }
    } else {
      this.closeMainMenu();
    }
  },
  toggleSubMenu(subTrigger) {
    const otherSubTriggers = subTrigger.closest("ul").querySelectorAll(".gnb-sub-trigger:not(.is-link)");
    otherSubTriggers.forEach((trigger) => {
      trigger.classList.remove("active");
      trigger.setAttribute("aria-expanded", "false");
      trigger.nextElementSibling?.classList.remove("active");
    });
    subTrigger.classList.add("active");
    subTrigger.setAttribute("aria-expanded", "true");
    subTrigger.nextElementSibling?.classList.add("active");
    this.adjustSubMenuHeight(subTrigger.closest(".gnb-main-list"));
  },
  createBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.classList.add("gnb-backdrop");
    document.body.appendChild(backdrop);
    // backdrop.style.display = "none";
    return backdrop;
  },
  toggleBackdrop(isOpen) {
    this.backdrop?.classList.toggle("active", isOpen);
    document.body.classList.toggle("is-gnb-web", isOpen);
    // this.backdrop.style.display = isOpen ? "block" : "none";
  },
  adjustSubMenuHeight(target) {
    // 서브 메뉴 높이를 활성 메뉴에 맞춰 조정
    const activeSubList = target.querySelector(".gnb-sub-list.active");
    const height = activeSubList?.scrollHeight || 0;
    target.style.minHeight = `${height}px`;
  },
  toggleScrollbar(isEnabled) {
    const isScrollNeeded = document.body.scrollHeight > window.innerHeight;
    document.body.classList.toggle("hasScrollY", isEnabled && isScrollNeeded);
  },
  resetMainMenu() {
    document.querySelectorAll(".krds-main-menu:not(.sample) .gnb-main-trigger:not(.is-link)").forEach((mainTrigger) => {
      mainTrigger.classList.remove("active");
      mainTrigger.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".krds-main-menu:not(.sample) .gnb-toggle-wrap").forEach((toggleWrap) => {
      toggleWrap.classList.remove("is-open");
    });
  },
  closeMainMenu() {
    this.resetMainMenu();
    this.toggleBackdrop(false);
    this.toggleScrollbar(false);
  },
  attachEvents(mainTriggers, subTriggers) {
    // krds-main-menu 외부 클릭시 닫기
    document.addEventListener("click", ({ target }) => {
      if (!target.closest(".krds-main-menu")) this.closeMainMenu();
    });

    // 백드롭 클릭 시 메뉴 닫기
    // this.backdrop.addEventListener("click", () => this.closeMainMenu());

    // ESC 키를 눌러 메뉴를 닫거나, TAB 키로 초점이 메뉴 외부로 이동했을 때 메뉴 닫기
    document.addEventListener("keyup", (event) => {
      if (event.code === "Escape" || !event.target.closest(".krds-main-menu")) {
        this.closeMainMenu();
      }
    });

    // 메인 메뉴 트리거 설정
    mainTriggers.forEach((mainTrigger) => {
      mainTrigger.addEventListener("click", () => this.toggleMainMenu(mainTrigger));
    });

    // 서브 메뉴 트리거 설정
    subTriggers.forEach((subTrigger) => {
      subTrigger.addEventListener("click", () => this.toggleSubMenu(subTrigger));
    });
  },
  setupKeyboardNavigation(mainTriggers) {
    const focusMenuItem = (element) => {
      if (element) {
        element.focus();
      }
    };
    const findFocusableElement = (element, direction) => {
      const sibling = direction === "next" ? "nextElementSibling" : "previousElementSibling";
      const parent = element.closest("li")?.[sibling];
      return parent ? parent.querySelector("[data-trigger]") : null;
    };
    // Home, End, 방향키를 통해 메뉴 항목 간의 이동을 처리
    document.addEventListener("keydown", (event) => {
      const target = event.target;
      if (target.getAttribute("data-trigger")) {
        switch (event.key) {
          case "Home":
            event.preventDefault();
            focusMenuItem(mainTriggers[0]);
            break;
          case "End":
            event.preventDefault();
            focusMenuItem(mainTriggers[mainTriggers.length - 1]);
            break;
          case "ArrowRight":
          case "ArrowDown":
            event.preventDefault();
            const nextElement = findFocusableElement(target, "next");
            focusMenuItem(nextElement);
            break;
          case "ArrowLeft":
          case "ArrowUp":
            event.preventDefault();
            const previousElement = findFocusableElement(target, "prev");
            focusMenuItem(previousElement);
            break;
          default:
            break;
        }
      }
    });
  },
};

/*** * krds_mainMenuMobile * ***/
const krds_mainMenuMobile = {
  init() {
    const mobileGnb = document.querySelector(".krds-main-menu-mobile:not(.sample)");

    if (!mobileGnb) return;

    if (mobileGnb.classList.contains("is-open")) {
      this.openMainMenu(mobileGnb);
    } else {
      mobileGnb.style.display = "none";
    }

    // gnb 외부 클릭 처리
    mobileGnb.addEventListener("click", (event) => {
      if (!event.target.closest(".gnb-wrap")) {
        mobileGnb.querySelector(".gnb-wrap").focus();
      }
    });

    // 접근성 설정(tab)
    this.setupAriaAttributes(mobileGnb);

    this.attachEvents(mobileGnb);
  },
  setupAriaAttributes(mobileGnb) {
    const tabList = mobileGnb.querySelector(".menu-wrap");
    if (tabList) {
      tabList.querySelector(".menu-wrap ul").setAttribute("role", "tablist");
      tabList.querySelectorAll(".menu-wrap li").forEach((li) => li.setAttribute("role", "none"));

      const tabs = document.querySelectorAll(".menu-wrap .gnb-main-trigger");
      tabs.forEach((item, idx) => {
        item.setAttribute("role", "tab");
        item.setAttribute("aria-selected", "false");
        item.setAttribute("aria-controls", item.getAttribute("href").substring(1));
        item.setAttribute("id", `tab-${idx}`);

        // gnb-main-trigger 클릭시 해당 위치로 스크롤
        item.addEventListener("click", (event) => {
          event.preventDefault();
          const id = item.getAttribute("aria-controls");
          const top = document.getElementById(id).offsetTop
          const gnbBody = document.querySelector(".gnb-body");
          gnbBody.scrollTo({
            left: 0,
            top: top,
            behavior: "smooth",
          });
        })
      });

      const tabPanels = document.querySelectorAll(".submenu-wrap .gnb-sub-list");
      tabPanels.forEach((item, idx) => {
        item.setAttribute("role", "tabpanel");
        item.setAttribute("aria-labelledby", `tab-${idx}`);
      });
    }
  },
  attachEvents(mobileGnb) {
    const id = mobileGnb.getAttribute("id");
    const openGnb = document.querySelector(`[aria-controls=${id}]`);
    const closeGnb = mobileGnb.querySelector("#close-nav");

    openGnb.addEventListener("click", () => this.openMainMenu(mobileGnb));
    closeGnb.addEventListener("click", () => this.closeMainMenu(mobileGnb));
    this.setupAnchorScroll(mobileGnb);
    this.setupAnchorLinks(mobileGnb);

    // 반응형 처리
    window.addEventListener("resize", () => {
      const isPC = windowSize.getWinSize() === "pc";
      if (isPC) this.closeMainMenu(mobileGnb);
    });
  },
  openMainMenu(mobileGnb) {
    const navContainer = mobileGnb.querySelector(".gnb-wrap");
    // const id = mobileGnb.getAttribute("id");
    // const openGnb = document.querySelector(`[aria-controls=${id}]`);
    // const header = document.querySelector("#krds-header");

    mobileGnb.style.display = "block";
    navContainer.setAttribute("tabindex", 0);
    // openGnb.setAttribute("aria-expanded", "true");
    // header.style.zIndex = "1000";

    // active 메뉴로 스크롤 이동
    const activeTrigger = document.querySelector(".gnb-main-trigger.active");
    if (activeTrigger) {
      const id = activeTrigger.getAttribute("aria-controls");
      const top = document.getElementById(id).offsetTop;
      const gnbBody = document.querySelector(".gnb-body");
      gnbBody.style.scrollBehavior = "auto";
      gnbBody.scrollTop = top
    } 
    
    setTimeout(() => {
      mobileGnb.classList.add("is-backdrop");
      mobileGnb.classList.add("is-open");
      document.body.classList.add("is-gnb-mobile");
    }, 100);

    // transition 종료후 실행
    mobileGnb.addEventListener("transitionend", function onTransitionEnd() {
      navContainer.focus();
      mobileGnb.removeEventListener("transitionend", onTransitionEnd);

      // inert 설정
      document.querySelector("#krds-header .header-in").setAttribute("inert", "");
      document.getElementById("container")?.setAttribute("inert", "");
      document.getElementById("footer")?.setAttribute("inert", "");
      
      // 포커스 트랩 설정
      common.focusTrap(mobileGnb);
    });

  },
  closeMainMenu(mobileGnb) {
    const id = mobileGnb.getAttribute("id");
    const openGnb = document.querySelector(`[aria-controls=${id}]`);
    // const header = document.querySelector("#krds-header");

    mobileGnb.classList.remove("is-backdrop");
    mobileGnb.classList.remove("is-open");
    // openGnb.setAttribute("aria-expanded", "false");
    // header.style.zIndex = "";

    // inert 설정
    document.querySelector("#krds-header .header-in").removeAttribute("inert");
    document.getElementById("container")?.removeAttribute("inert");
    document.getElementById("footer")?.removeAttribute("inert");
    
    // transition 종료후 실행
    mobileGnb.addEventListener("transitionend", function onTransitionEnd() {
      openGnb.focus();
      mobileGnb.removeEventListener("transitionend", onTransitionEnd);
    });
    
    setTimeout(() => {
      mobileGnb.style.display = "none";
      document.body.classList.remove("is-gnb-mobile");
    }, 400);
  },
  setupAnchorScroll(mobileGnb) {
    const gnbBody = mobileGnb.querySelector(".gnb-body");
    const navContainer = mobileGnb.querySelector(".gnb-wrap");
    const navItems = mobileGnb.querySelectorAll(".submenu-wrap .gnb-sub-list");
    const headerTabArea = mobileGnb.querySelector(".gnb-tab-nav");
    const headerTabMenu = headerTabArea?.querySelector(".menu-wrap");

    gnbBody.addEventListener("scroll", () => {
      const scrollTop = gnbBody.scrollTop;
      const scrollHeight = gnbBody.scrollHeight;
      const bodyHeight = gnbBody.clientHeight;

      navItems.forEach((item) => {
        const id = item.getAttribute("id");
        const menuLink = mobileGnb.querySelector(`[href="#${id}"]`);
        const offset = item.offsetTop;
        if (scrollTop >= offset || bodyHeight + scrollTop >= scrollHeight) {
          this.resetAnchorMenu();
          menuLink.classList.add("active");
          menuLink.setAttribute("aria-selected", "true");
          if (headerTabArea) {
            const headerTabMenuUl = headerTabMenu.querySelector("ul");
            gnbBody.addEventListener("scrollend", () => {
              headerTabMenuUl.scrollLeft = menuLink.offsetLeft;
            });
          }
        }
      });

      this.handleTopScroll(headerTabArea, navContainer, gnbBody);
    });
  },
  handleTopScroll(headerTabArea, navContainer, gnbBody) {
    // gnb-mobile-type1(headerTabArea: gnb-tab-nav)
    let lastBodyScrollY = 0;

    if (!headerTabArea) return; // 요소가 없을 경우 함수 종료

    gnbBody.addEventListener("scroll", (event) => {
      const bodyScrollY = event.target.scrollTop;

      if (bodyScrollY > 0) {
        headerTabArea.style.height = `${headerTabArea.scrollHeight}px`;
        headerTabArea.style.transition = "ease-out .4s";
        navContainer.classList.add("is-active");
      } else if (bodyScrollY < 50 && bodyScrollY < lastBodyScrollY) {
        headerTabArea.style.height = "";
        headerTabArea.style.transition = "ease-out .4s .2s";
        setTimeout(() => {
          navContainer.classList.remove("is-active");
        }, 600);
      }

      lastBodyScrollY = bodyScrollY;
    });
  },
  setupAnchorLinks(mobileGnb) {
    const menuItems = mobileGnb.querySelectorAll(".menu-wrap .gnb-main-trigger");
    const navItems = mobileGnb.querySelectorAll(".submenu-wrap .gnb-sub-list");

    if (!document.querySelector(".menu-wrap .gnb-main-trigger.active")) {
      menuItems[0].classList.add("active");
      menuItems[0].setAttribute("aria-selected", "true");
    }

    // 3depth
    navItems.forEach((item) => {
      const depth3Items = item.querySelectorAll(".has-depth3");
      if (depth3Items.length > 0) {
        depth3Items.forEach((item) => {
          if (item.classList.contains("active")) {
            item.classList.add("active");
            item.setAttribute("aria-expanded", "true");
            item.nextElementSibling.classList.add("is-open");
          } else {
            item.setAttribute("aria-expanded", "false");
          }
          item.addEventListener("click", (event) => this.handleDepth3Click(event, item));
        });
      }
    });

    // 4depth
    navItems.forEach((item) => {
      const depth4Items = item.querySelectorAll(".has-depth4");
      if (depth4Items.length > 0) {
        depth4Items.forEach((item) => {
          item.addEventListener("click", (event) => this.handleDepth4Click(event, item));
        });
      }
    });
  },
  handleDepth3Click(event) {
    const isActive = event.target.classList.contains("active");

    const resetList = () => {
      document.querySelectorAll(".has-depth3").forEach((depth3) => {
        depth3.classList.remove("active");
        depth3.setAttribute("aria-expanded", "false");
        depth3.nextElementSibling.classList.remove("is-open");
      });
    };

    if (!isActive) {
      // resetList();
      event.target.classList.add("active");
      event.target.setAttribute("aria-expanded", "true");
      event.target.nextElementSibling.classList.add("is-open");
    } else {
      // resetList();
      event.target.classList.remove("active");
      event.target.setAttribute("aria-expanded", "false");
      event.target.nextElementSibling.classList.remove("is-open");
    }
  },
  handleDepth4Click(event) {
    const target = event.target.nextElementSibling;
    const prevButton = target.querySelector(".trigger-prev");
    const closeButton = target.querySelector(".trigger-close");

    target.style.display = "block";
    setTimeout(() => {
      target.classList.add("is-open");
    }, 0);
    prevButton.focus();

    const depth4Close = () => {
      target.classList.remove("is-open");
      event.target.focus();
      setTimeout(() => {
        target.style.display = "";
      }, 400);
    };

    prevButton.addEventListener("click", depth4Close);
    closeButton.addEventListener("click", depth4Close);

    // 포커스 트랩 설정
    common.focusTrap(target);
  },
  resetAnchorMenu() {
    document.querySelectorAll(".krds-main-menu-mobile .menu-wrap .gnb-main-trigger").forEach((menu) => {
      menu.classList.remove("active");
      menu.setAttribute("aria-selected", "false");
    });
  },
};

/*** * krds_sideNavigation * ***/
const krds_sideNavigation = {
  init() {
    this.setupSideNavLists();
    this.setupToggleEvents();
    this.setupPopupEvents();
  },
  setupSideNavLists() {
    const sideNavLists = document.querySelectorAll(".krds-side-navigation .lnb-list");
    sideNavLists.forEach((navList) => {
      const navItems = navList.querySelectorAll("li");
      navItems.forEach((navItem) => this.setupNavItem(navItem));
    });
  },
  setupNavItem(navItem) {
    const navButton = navItem.querySelector(".lnb-btn");
    if (!navButton || !navButton.className.includes("lnb-toggle")) return;

    const uniqueIdx = `lnbmenu-${Math.random().toString(36).substring(2, 9)}`;
    const navSubmenu = navButton.nextElementSibling;

    // aria 설정
    navButton.setAttribute("aria-controls", uniqueIdx);
    navButton.setAttribute("aria-expanded", navButton.classList.contains("active"));

    // 서브메뉴 id 설정 및 popup 처리
    if (navButton.classList.contains("lnb-toggle-popup")) {
      navButton.setAttribute("aria-haspopup", "true");
    }
    if (navSubmenu && navSubmenu.className.includes("lnb-submenu")) {
      const navSubmenuList = navSubmenu.classList.contains("lnb-submenu-lv2") ? navSubmenu : navSubmenu.querySelector(":scope > ul");
      navSubmenuList?.setAttribute("id", uniqueIdx);
    }
  },
  setupToggleEvents() {
    const toggleButtons = document.querySelectorAll(".krds-side-navigation .lnb-list:not(.exception-case) .lnb-toggle");
    toggleButtons.forEach((toggleButton) => {
      toggleButton.addEventListener("click", () => {
        const expand = toggleButton.getAttribute("aria-expanded") !== "true";
        
        //this.toggleMenu(toggleButton, expand); 클릭 시 해당 버튼만 활성화 상태로 변경되어 해당 이벤트 주석처리.
        //this.closeSiblingMenus(toggleButton);  클릭 시 해당 버튼만 활성화 상태로 변경되어 해당 이벤트 주석처리.
        this.setActiveNav(toggleButton, expand);
      });
    });
  },
  setActiveNav(toggleButton, expand){
    const parentListItem = toggleButton.closest("li");
    toggleButton.setAttribute('aria-expanded', expand ? 'true' : 'false');
    parentListItem.classList.toggle('active', expand);
  },
  setupPopupEvents() {
    let lastClickedButton = null;

    const popupToggleButtons = document.querySelectorAll(".lnb-toggle-popup");
    const popupSubmenus = document.querySelectorAll(".lnb-submenu-lv2");

    // 팝업 토글 버튼
    popupToggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const popupSubmenu = button.nextElementSibling;
        if (popupSubmenu && popupSubmenu.classList.contains("lnb-submenu-lv2")) {
          popupSubmenu.classList.add("active");
          button.setAttribute("aria-expanded", "true");

          popupSubmenu.addEventListener(
            "transitionend",
            () => {
              popupSubmenu.querySelector(".lnb-btn-tit")?.focus();
            },
            { once: true }
          );

          lastClickedButton = button;
        }
      });
    });

    // 서브 메뉴가 포커스를 잃으면 비활성화
    popupSubmenus.forEach((popupSubmenu) => {
      popupSubmenu.addEventListener("focusout", (event) => {
        // 포커스가 서브메뉴 밖으로 나갔는지 확인
        if (!popupSubmenu.contains(event.relatedTarget)) {
          popupSubmenu.classList.remove("active");

          if (lastClickedButton) {
            lastClickedButton.setAttribute("aria-expanded", "false");
            popupSubmenu.addEventListener(
              "transitionend",
              () => {
                lastClickedButton.focus();
              },
              { once: true }
            );
          }
        }
      });

      // lnb-btn-tit 클릭 시 서브메뉴 닫기
      const subMenuTitleButton = popupSubmenu.querySelector(".lnb-btn-tit");
      subMenuTitleButton?.addEventListener("click", () => {
        lastClickedButton?.focus();
      });
    });
  },
  toggleMenu(toggleButton, expand) {
    const parentListItem = toggleButton.closest("li");
    toggleButton.setAttribute("aria-expanded", expand);
    toggleButton.classList.toggle("active", expand);
    parentListItem.classList.toggle("active", expand);
  },
  closeSiblingMenus(toggleButton) {
    const parentListItem = toggleButton.closest("li");
    const siblingButtons = parentListItem.parentNode.querySelectorAll(":scope > li > .lnb-toggle");
    siblingButtons.forEach((siblingButton) => {
      if (siblingButton !== toggleButton) {
        this.toggleMenu(siblingButton, false); 
      }
    });
  },
  setActiveCurrentPage() {
    // 활성화된 페이지를 찾는 예(개발 환경에 맞게 수정)
    const currentPage = window.location.pathname.split("/").slice(-1)[0].replace(".html", "");
    const lnbLinks = document.querySelectorAll(".krds-side-navigation .lnb-link");
    lnbLinks.forEach((link) => {
      const linkPage = link.getAttribute("href").split("/").pop().replace(".html", "");
      if (linkPage === currentPage) {
        link.closest(".lnb-item").classList.add("active");
        link.closest(".lnb-item").querySelector(".lnb-toggle")?.classList.add("active");
        link.closest(".lnb-item").querySelector(".lnb-toggle")?.setAttribute("aria-expanded", "true");
        link.closest("li").classList.add("active");
        // 접근성 현재 페이지 표시 aria-current
        link.setAttribute("aria-current", "page");
      }
    });
  },
};

/*** * krds_tab * ***/
const krds_tab = {
  layerTabArea: null,
  init() {
    this.layerTabArea = document.querySelectorAll(".krds-tab-area.layer");

    if (!this.layerTabArea.length) return;

    this.setupTabs();
  },
  setupTabs() {
    this.layerTabArea.forEach((tabArea) => {
      const layerTabs = tabArea.querySelectorAll(".tab > ul > li");

      // 탭 설정
      layerTabs.forEach((tab) => {
        // 이미 이벤트가 연결된 탭을 건너뜀
        if (!tab.dataset.listenerAttached) {
          // 연결된 탭 패널 찾기
          const control = tab.getAttribute("aria-controls");
          const selectedTabPanel = document.getElementById(control);

          // aria 설정
          tab.setAttribute("aria-selected", "false");
          tab.setAttribute("role", "tab");
          selectedTabPanel.setAttribute("role", "tabpanel");

          // 초기 active 설정
          if (tab.classList.contains("active")) {
            if (!tab.querySelector("button .sr-only")) {
              tab.setAttribute("aria-selected", "true");
              tab.querySelector("button").append(this.createAccText()); // 초점이 버튼이라 aria-selected 대체 텍스트 필요
            }
          }

          // 클릭 이벤트
          tab.addEventListener("click", () => {
            const closestTabs = tab.closest(".krds-tab-area.layer > .tab").querySelectorAll("li");
            const closestTabPanels = tab.closest(".krds-tab-area.layer").querySelectorAll(":scope > .tab-conts-wrap > .tab-conts");

            this.resetTabs(closestTabs, closestTabPanels);

            tab.classList.add("active");
            tab.querySelector("button").append(this.createAccText());
            tab.setAttribute("aria-selected", "true");
            selectedTabPanel.classList.add("active");
          });

          // 키보드 이벤트
          this.setupKeyboardNavigation(tab);

          // 이벤트가 추가된 탭을 표시
          tab.dataset.listenerAttached = "true";
        }
      });
    });
  },
  createAccText() {
    const tabAccTag = document.createElement("i");
    tabAccTag.classList.add("sr-only");
    tabAccTag.textContent = "선택됨";
    return tabAccTag;
  },
  resetTabs(closestTabs, closestTabPanels) {
    closestTabs.forEach((tab) => {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
      // 대체 텍스트 삭제
      const srOnly = tab.querySelector(".sr-only");
      if (srOnly) tab.querySelector("button").removeChild(srOnly);
    });
    closestTabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });
  },
  setupKeyboardNavigation(tab) {
    tab.addEventListener("keydown", function (event) {
      let newTab;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        newTab = tab.nextElementSibling?.querySelector("button");
      } else if (event.key === "ArrowLeft") {
        newTab = tab.previousElementSibling?.querySelector("button");
      }
      newTab?.focus();
    });
  },
};

/*** * krds_accordion * ***/
const krds_accordion = {
  accordionButtons: null,
  accordionHandlers: new Map(),
  init() {
    this.accordionButtons = document.querySelectorAll(".btn-accordion");

    if (!this.accordionButtons.length) return;

    this.setupAccordions();
  },
  accordionToggle(button, accordionItems, accordionType, currentItem) {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    // singleOpen 타입일 경우, 다른 항목 닫기
    if (accordionType !== "multiOpen" && !currentItem.classList.contains("active")) {
      accordionItems.forEach((otherItem) => {
        const otherButton = otherItem.querySelector(".btn-accordion");
        otherButton.setAttribute("aria-expanded", "false");
        otherButton.classList.remove("active");
        otherItem.classList.remove("active");
      });
    }
    // 현재 항목 상태 토글
    button.setAttribute("aria-expanded", !isExpanded);
    button.classList.toggle("active", !isExpanded);
    currentItem.classList.toggle("active", !isExpanded);
  },
  setupAccordions() {
    this.accordionButtons.forEach((button, idx) => {
      const accordionContainer = button.closest(".krds-accordion");
      const accordionItems = accordionContainer.querySelectorAll(".accordion-item");
      const currentItem = button.closest(".accordion-item");
      const accordionContent = currentItem.querySelector(".accordion-collapse");
      const accordionType = accordionContainer.dataset.type || "singleOpen";
      const isOpen = accordionContainer.classList.contains("is-open");

      // 접근성 속성 초기값 설정
      this.setupAriaAttributes(button, accordionContent, idx);

      // 초기 오픈 상태 설정
      if (isOpen || currentItem.classList.contains("active")) {
        button.setAttribute("aria-expanded", "true");
        button.classList.add("active");
        currentItem.classList.add("active");
      }

      // 핸들러 고정 및 저장
      let toggleHandler = this.accordionHandlers.get(button);
      if (!toggleHandler) {
        toggleHandler = this.accordionToggle.bind(this, button, accordionItems, accordionType, currentItem);
        this.accordionHandlers.set(button, toggleHandler);
      }

      // 기존 이벤트 리스너 제거 및 새로 등록
      button.removeEventListener("click", toggleHandler);
      button.addEventListener("click", toggleHandler);
    });
  },
  setupAriaAttributes(button, accordionContent, idx) {
    const uniqueIdx = `${idx}${Math.random().toString(36).substring(2, 9)}`;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("id", `accordionHeader-id-${uniqueIdx}`);
    button.setAttribute("aria-controls", `accordionCollapse-id-${uniqueIdx}`);
    accordionContent.setAttribute("role", "region");
    accordionContent.setAttribute("id", `accordionCollapse-id-${uniqueIdx}`);
    accordionContent.setAttribute("aria-labelledby", `accordionHeader-id-${uniqueIdx}`);
  },
};

/*** * krds_modal * ***/
const krds_modal = {
  modalOpenTriggers: null,
  modalCloseTriggers: null,
  outsideClickHandlers: {},
  init() {
    this.modalOpenTriggers = document.querySelectorAll(".open-modal");
    this.modalCloseTriggers = document.querySelectorAll(".close-modal");

    if (!this.modalOpenTriggers.length || !this.modalCloseTriggers.length) return;

    this.setupTriggers();
  },
  setupTriggers() {
    // 모달 열기 이벤트 설정
    this.modalOpenTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        const modalId = trigger.getAttribute("data-target");
        if (modalId) {
          // aria 설정
          trigger.setAttribute("data-modal-id", modalId);
          trigger.classList.add("modal-opened");
          trigger.setAttribute("tabindex", "-1");
			
          this.openModal(modalId);
        }
      });
    });
    // 모달 닫기 이벤트 설정
    this.modalCloseTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        const modalId = trigger.closest(".krds-modal").getAttribute("id");

        if (modalId) {
          this.closeModal(modalId);
        }
      });
    });
  },
  openModal(id) {
    const modalElement = document.getElementById(id);
    const dialogElement = modalElement.querySelector(".modal-content");
    const modalBack = modalElement.querySelector(".modal-back");
    // const modalTitle = modalElement.querySelector(".modal-title");
    const modalConts = modalElement.querySelector(".modal-conts");

    document.querySelector("body").classList.add("scroll-no");
    dialogElement.removeAttribute("tabindex");
    modalElement.setAttribute("role", "dialog");
    modalElement.classList.add("shown");
    modalBack.classList.add("in");
    // modalTitle.setAttribute("tabindex", "0");

    // modal-conts 스크롤 일때 tabindex 처리
    if (modalConts.scrollHeight > modalConts.clientHeight) {
      modalConts.setAttribute("tabindex", "0");
    } else {
      modalConts.removeAttribute("tabindex");
    }

    // css transition 딜레이
    setTimeout(() => {
      modalElement.classList.add("in");
    }, 150);
    
    //열린 팝업창 포커스
    const focusables = modalElement.querySelectorAll(`a, button, [tabindex="0"], input, textarea, select`);
    setTimeout(() => {
      // modalTitle.focus();
      focusables[0].focus();
    }, 350);

    // ESC 모달 닫기
    dialogElement.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" || event.key === "Esc") {
          this.closeModal(dialogElement.closest(".krds-modal").id);
        }
      },
      { once: true }
    );

    // 모달 외부 클릭 처리 핸들러 정의 및 저장
    if (!this.outsideClickHandlers[id]) {
      this.outsideClickHandlers[id] = (event) => {
        if (!event.target.closest(".modal-content")) {
          // modalTitle.focus();
          focusables[0].focus();

          // dialogElement.focus();
          // this.closeModal(id);
        }
      };
    }
    // 이벤트 리스너 제거 후 다시 등록
    modalElement.removeEventListener("click", this.outsideClickHandlers[id]);
    modalElement.addEventListener("click", this.outsideClickHandlers[id]);

    // 포커스 트랩 설정
    common.focusTrap(dialogElement);

    // 2개 이상의 모달이 열려 있는 경우 z-index 업데이트
    this.updateZIndex(modalElement);

    // inert 설정
    document.getElementById("wrap")?.setAttribute("inert", "");
  },
  closeModal(id) {
    const modalElement = document.getElementById(id);
    const openModals = document.querySelectorAll(".modal.in:not(.sample)");
    const modalBack = modalElement.querySelector(".modal-back");

    modalElement.classList.remove("in");
    modalBack.classList.remove("in");

    // css transition 딜레이
    setTimeout(() => {
      modalElement.classList.remove("shown");
    }, 350);

    // 마지막 모달이 닫힐 때 페이지 스크롤 복원
    if (openModals.length < 2) {
      document.querySelector("body").classList.remove("scroll-no");
    }
    
    // inert 설정
    document.getElementById("wrap")?.removeAttribute("inert");

    // 모달을 열었던 버튼으로 포커스 복귀
    this.returnFocusToTrigger(id);
  },
  updateZIndex(modalElement) {
    const openModals = document.querySelectorAll(".modal.in:not(.sample)");
    const openModalsLengtn = openModals.length + 1;
    const newZIndex = 1010 + openModalsLengtn;
    if (openModalsLengtn > 1) {
      modalElement.style.zIndex = newZIndex;
      modalElement.querySelector(".modal-back").classList.remove("in");
    }
  },
  returnFocusToTrigger(id) {
    const triggerButton = document.querySelector(`.modal-opened[data-modal-id="${id}"]`);
    if (triggerButton) {
      triggerButton.focus();
      triggerButton.setAttribute("tabindex", "0");
      triggerButton.classList.remove("modal-opened");
      triggerButton.removeAttribute("data-modal-id");
    }
  },
};

/*** * krds_contextualHelp * ***/
const krds_contextualHelp = {
  tooltipButtons: null,
  init() {
    this.tooltipButtons = document.querySelectorAll(".krds-contextual-help .tooltip-btn");

    if (!this.tooltipButtons.length) return;

    this.setupTooltips();
    this.setupFocusOutEvent();
  },
  setupTooltips() {
    this.tooltipButtons.forEach((button) => {
      const tooltipContainer = button.closest(".krds-contextual-help");
      const tooltipPopover = tooltipContainer.querySelector(".tooltip-popover");
      const closeButton = tooltipPopover.querySelector(".tooltip-close");

      button.setAttribute("aria-expanded", "false");
      tooltipPopover.setAttribute("role", "tooltip");

      // tooltipWrap에 포지션이 없을때 기본값 설정
      if (tooltipContainer && tooltipContainer.classList.length === 1) {
        tooltipContainer.classList.add("top", "left");
      }

      button.addEventListener("click", () => {
        this.toggleTooltip(button, tooltipPopover, tooltipContainer);
      });
      closeButton.addEventListener("click", () => {
        this.closeAllTooltips();
      });

      window.addEventListener("resize", () => {
        this.adjustTooltipPosition(tooltipContainer, tooltipPopover);
      });

      // ESC 닫기
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" || event.key === "Esc") {
          this.closeAllTooltips();
        }
      });
    });
  },
  toggleTooltip(button, tooltipPopover, tooltipContainer) {
    const isVisible = tooltipPopover.style.display === "block";

    this.closeAllTooltips();

    if (!isVisible) {
      tooltipPopover.style.display = "block";
      const focusables = tooltipPopover.querySelector(`a, button, [tabindex="0"], input, textarea, select`);
      focusables?.focus();
      button.setAttribute("aria-expanded", "true");

      this.adjustTooltipPosition(tooltipContainer, tooltipPopover);
    }
  },
  closeAllTooltips() {
    const otherPopovers = document.querySelectorAll(".krds-contextual-help .tooltip-popover");
    otherPopovers.forEach((popover) => {
      popover.style.display = "none";
    });
    this.tooltipButtons.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
  },
  adjustTooltipPosition(tooltipContainer, tooltipPopover) {
    // const isMobile = windowSize.getWinSize() === "mob";
    const isMobile = window.innerWidth <= 768;
    const tooltipAction = tooltipContainer.querySelector(".tooltip-action");

    if (isMobile) {
      const rootStyles = getComputedStyle(document.querySelector(":root"));
      const contentsPaddingX = rootStyles.getPropertyValue("--krds-contents-padding-x").trim().split("px")[0];
      const tooltipActionRect = tooltipAction.getBoundingClientRect();
      const offsetLeft = tooltipActionRect.left - contentsPaddingX;
      const width = document.body.clientWidth - (contentsPaddingX * 2);
      tooltipPopover.style.left = `-${offsetLeft}px`;
      tooltipPopover.style.width = `${width}px`;
    } else {
      tooltipPopover.style.left = "";
      tooltipPopover.style.right = "";
      tooltipPopover.style.width = "360px";
    }
  },
  setupFocusOutEvent() {
    document.addEventListener("click", (event) => {
      const clickedInsideTooltip = event.target.closest(".tooltip-action");
      if (!clickedInsideTooltip ) {
        this.closeAllTooltips();
      } else {
        const FocusPopover = clickedInsideTooltip.querySelector('.tooltip-close');
        FocusPopover.addEventListener('focusout', ()=>{
          this.closeAllTooltips();
          clickedInsideTooltip.querySelector(".tooltip-btn")?.focus();
        });
      }
    });
  },
};

/*** * krds_tooltip * ***/
const krds_tooltip = {
  tooltip: null,
  isMobile: null,
  init() {
    this.tooltip = document.querySelectorAll(".krds-tooltip");
    this.isMobile = windowSize.getWinSize() === "mob";

    if (!this.tooltip.length) return;

    this.setupTooltips();
    this.setupGlobalEvents();
  },
  setupTooltips() {
    this.tooltip.forEach((item, index) => {
      //  tooltipText
      const tooltipText = item.getAttribute("data-tooltip");
      const disabled = item.hasAttribute("disabled");

      if (!tooltipText || disabled) return;

      // ID 부여
      const uniqueIdx = `tooltip-popover-${index}${Math.random().toString(36).substring(2, 9)}`;
      item.setAttribute("aria-labelledby", uniqueIdx);

      // TooltipPopover 생성
      const tooltipBtnText = item.innerText;
      const tooltipPopover = this.createTooltipPopover(uniqueIdx, tooltipBtnText, tooltipText);
      item.parentNode.insertBefore(tooltipPopover, item.nextSibling);

      // Show/Hide 함수 정의
      const showTooltip = () => this.showTooltip(item, tooltipPopover);

      // 이벤트 등록
      this.registerEvents(item, showTooltip);

      // ESC 닫기
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" || event.key === "Esc") {
          this.closeAllTooltips();
        }
      });
    });
  },
  createTooltipPopover(uniqueIdx, tooltipBtnText, tooltipText) {
    const tooltipPopover = document.createElement("div");
    tooltipPopover.classList.add("krds-tooltip-popover");
    tooltipPopover.setAttribute("id", uniqueIdx);
    tooltipPopover.setAttribute("aria-hidden", "true");
    tooltipPopover.innerHTML = "";
    tooltipPopover.innerHTML = `
      <span class="sr-only">${tooltipBtnText}</span>
      ${tooltipText}
    `;

    return tooltipPopover;
  },
  registerEvents(item, showTooltip) {
    item.addEventListener("mouseover", showTooltip);
    item.addEventListener("mouseout", this.closeAllTooltips);
    item.addEventListener("focus", showTooltip);
    item.addEventListener("focusout", this.closeAllTooltips);
  },
  showTooltip(item, tooltipPopover) {
    // tooltip-box
    if (item.classList.contains("tooltip-box")) {
      tooltipPopover.classList.add("tooltip-box");
    }
    // tooltip-vertical
    if (item.classList.contains("tooltip-vertical")) {
      tooltipPopover.classList.add("tooltip-vertical");
    }

    tooltipPopover.classList.add("active");

    const { top, left } = this.calculateTooltipPosition(item, tooltipPopover);
    const mobileSmall = window.innerWidth <= 420;
    tooltipPopover.style.top = `${top}px`;
    tooltipPopover.style.left = mobileSmall ? "50%" : `${left}px`;
  },
  closeAllTooltips() {
    const otherPopovers = document.querySelectorAll(".krds-tooltip-popover");
    otherPopovers.forEach((popover) => {
      if (!popover.classList.contains("active")) return;
      popover.style = "";
      popover.className = "krds-tooltip-popover";
    });
  },
  calculateTooltipPosition(item, tooltipPopover) {
    // 툴팁과 기준 요소 간격
    const tooltipGap = 12;
    const { clientHeight: tooltipHeight, clientWidth: tooltipWidth } = tooltipPopover;
    const { top: itemTop, left: itemLeft, right: itemRight, height: itemHeight, width: itemWidth } = item.getBoundingClientRect();
    const halfWindowWidth = window.innerWidth / 2;
    const halfWindowHeight = window.innerHeight / 2;

    let tooltipTop;
    let tooltipLeft;

    const isVertical = this.isMobile || item.classList.contains("tooltip-box") || item.classList.contains("tooltip-vertical");

    if (isVertical) {
      if (itemTop + itemHeight > halfWindowHeight) {
        tooltipTop = itemTop - tooltipHeight - tooltipGap; // 위쪽
        tooltipPopover.classList.add("top");
      } else {
        tooltipTop = itemTop + itemHeight + tooltipGap; // 아래쪽
        tooltipPopover.classList.add("bottom");
      }
      // 좌우 위치
      if (itemLeft + itemWidth > halfWindowWidth) {
        tooltipLeft = itemRight - tooltipWidth; // 오른쪽 정렬
        tooltipPopover.classList.add("right");
        // 화면 오른쪽 여유 공간이 충분할 때 가운데 정렬
        if (window.innerWidth - (itemLeft + itemWidth) > tooltipWidth / 2) {
          tooltipLeft = itemLeft + (itemWidth - tooltipWidth) / 2;
          tooltipPopover.classList.remove("right");
        }
      } else {
        // 화면 왼쪽 여유 공간이 충분할 때 가운데 정렬
        tooltipLeft = itemLeft + (itemWidth - tooltipWidth) / 2;
        // 왼쪽 공간 부족 시 보정
        if (tooltipLeft < 0) {
          tooltipLeft = itemLeft;
          tooltipPopover.classList.add("left");
        } else {
          tooltipPopover.classList.remove("left");
        }
      }
    } else {
      // 가로형 툴팁
      tooltipTop = itemTop + (itemHeight - tooltipHeight) / 2;
      if (itemLeft + itemWidth > halfWindowWidth) {
        tooltipLeft = itemLeft - tooltipWidth - tooltipGap; // 왼쪽
        tooltipPopover.classList.add("right");
      } else {
        tooltipLeft = itemRight + tooltipGap; // 오른쪽
        tooltipPopover.classList.remove("right");
      }
    }
    return { top: tooltipTop, left: tooltipLeft };
  },
  setupGlobalEvents() {
    window.addEventListener("scroll", () => {
      this.closeAllTooltips();
    });
    window.addEventListener("resize", () => {
      this.isMobile = windowSize.getWinSize() === "mob";
      this.closeAllTooltips();
    });
  },
};

/*** * krds_calendar * ***/ // *btn-set-date: aria-pressed > aria-selected 변경 해야함(상위 속성도 같이)
const krds_calendar = {
  datePickerArea: null,
  activeDateSelector: null,
  init() {
    this.datePickerArea = document.querySelectorAll(".krds-calendar-area");

    if (!this.datePickerArea.length) return;

    this.setupDatePicker();
    this.setupGlobalListeners();
    this.setupOpenCloseEvents();
    this.setupDateComboBox("init");
    this.toggleDateSelector();
    this.actionDatePicker();

    // ui 동작 확인용 테스트 코드
    this.example();
  },
  setupDatePicker() {
    this.datePickerArea.forEach((datePicker) => {
      datePicker.querySelector(".calendar-wrap").setAttribute("tabindex", "0");

      // 접근성 초기값 설정
      datePicker.querySelectorAll(".calendar-tbl td").forEach((cell) => {
        const dateButton = cell.querySelector(".btn-set-date");
        if (!dateButton) return;
        if (cell.classList.contains("period")) {
          dateButton.setAttribute("aria-pressed", "true");
        }
        if (cell.classList.contains("day-event")) {
          dateButton.setAttribute("aria-label", `${dateButton.innerText} 일정있음`);
        }
        if (cell.classList.contains("today")) {
          dateButton.setAttribute("aria-label", `${dateButton.innerText} 오늘`);
        }
      });
    });
  },
  setupGlobalListeners() {
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".calendar-conts")) {
        this.closeAllDatePickers();
      }
    });
  },
  setupOpenCloseEvents() {
    const datePickerButtons = document.querySelectorAll(".form-btn-datepicker");
    datePickerButtons.forEach((button) => {
      button.addEventListener("click", () => this.openDatePicker(button));
    });

    // 탭 이동 닫기
    this.datePickerArea.forEach((datePicker) => {
      // 마지막 버튼이 blur될 때 datepicker 닫기(포커스 트랩을 사용하지 않을때 적용)
      // const lastActionButton = datePicker.querySelector(".calendar-btn-wrap .krds-btn:last-child");
      // if (lastActionButton) {
      //   lastActionButton.addEventListener("blur", () => this.closeAllDatePickers());
      // }

      // calendar-select의 마지막 버튼이 blur될 때 선택기 닫기
      datePicker.querySelectorAll(".calendar-select").forEach((select) => {
        const lastSelectButton = select.querySelector(".sel > li:last-child > button");
        if (lastSelectButton) {
          lastSelectButton.addEventListener("blur", () => {
            this.resetDateSelector();
          });
        }
      });
    });
  },
  openDatePicker(button) {
    // 열려있던 달력 모두 닫기
    this.closeAllDatePickers();

    const currentDatePicker = button.closest(".calendar-conts").querySelector(".krds-calendar-area");
    currentDatePicker.classList.add("active");

    // 접근성
    button.setAttribute("aria-expanded", "true");

    // 포커스 트랩 설정
    common.focusTrap(currentDatePicker);

    // 포커스 이동
    setTimeout(() => {
      currentDatePicker.querySelector(".calendar-wrap").focus();
    }, 50);
  },
  resetDateSelector() {
    this.datePickerArea.forEach((datePicker) => {
      const selectMenus = datePicker.querySelectorAll(".calendar-select");
      selectMenus.forEach((select) => select.classList.remove("active"));
      this.setupDateComboBox("reset");
      this.activeDateSelector = null;
    });
  },
  closeAllDatePickers() {
    this.datePickerArea.forEach((datePicker) => {
      if (datePicker.classList.contains("active")) {
        const target = datePicker.closest(".calendar-conts").querySelector(".form-btn-datepicker");
        target.focus();
      }
      datePicker.classList.remove("active");
      this.resetDateSelector();
    });

    // 접근성
    const datePickerButtons = document.querySelectorAll(".form-btn-datepicker");
    datePickerButtons.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
  },
  setupDateComboBox(option, target) {
    const comboBoxs = document.querySelectorAll(".calendar-drop-down > button");
    if (option === "init") {
      comboBoxs.forEach((comboBox, idx) => {
        const listBox = comboBox.nextElementSibling.querySelector(".sel");
        const listOptions = listBox.querySelectorAll("button");
        const uniqueIdx = `${idx}${Math.random().toString(36).substring(2, 9)}`;

        comboBox.setAttribute("role", "combobox");
        comboBox.setAttribute("aria-haspopup", "listbox");
        comboBox.setAttribute("aria-expanded", "false");
        comboBox.setAttribute("aria-controls", `combo-list-${uniqueIdx}`);

        listBox.setAttribute("role", "listbox");
        listBox.setAttribute("id", `combo-list-${uniqueIdx}`);
        listBox.querySelectorAll("li").forEach((li) => li.setAttribute("role", "none"));

        listOptions.forEach((listOption) => {
          listOption.setAttribute("role", "option");
          listOption.setAttribute("aria-selected", "false");
          if (listOption.classList.contains("active")) {
            listOption.setAttribute("aria-selected", "true");
            comboBox.innerHTML = listOption.innerHTML;
          }
        });
      });
    }
    if (option === "reset") {
      comboBoxs.forEach((comboBox) => {
        comboBox.setAttribute("aria-expanded", "false");
      });
      if (target) {
        target.setAttribute("aria-expanded", "true");
      }
    }
    if (option === "change") {
      comboBoxs.forEach((comboBox) => {
        const listBox = comboBox.nextElementSibling.querySelector(".sel");
        const listOptions = listBox.querySelectorAll("button");

        comboBox.setAttribute("aria-expanded", "false");

        listOptions.forEach((listOption) => {
          listOption.classList.remove("active");
          listOption.setAttribute("aria-selected", "false");
        });
      });
      if (target) {
        target.setAttribute("aria-selected", "true");
        target.classList.add("active");
        target.closest(".calendar-drop-down").querySelector("button").innerHTML = target.innerHTML;
      }

      // ui 동작 확인용 테스트 코드
      this.example();
    }
  },
  toggleDateSelector() {
    this.datePickerArea.forEach((datePicker) => {
      const selectToggleButtons = datePicker.querySelectorAll(".calendar-drop-down .btn-cal-switch");
      const selectOptions = datePicker.querySelectorAll(".calendar-select .sel button");

      // 공통 이벤트 처리
      const handleBtnClick = (event, selectMenu) => {
        const layer = selectMenu;

        // 이미 활성화된 레이어 닫기
        if (this.activeDateSelector === layer) {
          layer.classList.remove("active");
          this.setupDateComboBox("reset");
          this.activeDateSelector = null;
          return;
        }

        // 현재 열려 있는 레이어가 있으면 닫음
        if (this.activeDateSelector) {
          this.activeDateSelector.classList.remove("active");
          this.setupDateComboBox("reset");
        }

        // 클릭한 버튼에 해당하는 레이어 열기
        layer.classList.add("active");
        this.setupDateComboBox("reset", event.target);
        this.activeDateSelector = layer;
      };

      // 셀렉터 설정
      selectToggleButtons.forEach((toggle) => {
        toggle.addEventListener("click", (event) => {
          const selectMenu = event.target.closest(".calendar-drop-down").querySelector(".calendar-select");
          handleBtnClick(event, selectMenu);
        });
      });

      // 년도, 월 선택
      selectOptions.forEach((option) => {
        option.addEventListener("click", (event) => {
          this.resetDateSelector();
          this.setupDateComboBox("change", event.target);

          // 포커스 이동
          setTimeout(() => {
            option.closest(".calendar-drop-down").querySelector(".btn-cal-switch")?.focus();
          }, 50);
        });
      });

      // esc 닫기
      datePicker.addEventListener("keydown", (event) => {
        if (event.code === "Escape") {
          this.resetDateSelector();
        }
      });
    });
  },
  actionDatePicker() {
    this.datePickerArea.forEach((datePicker) => {
      const actionButtons = datePicker.querySelectorAll(".calendar-btn-wrap button:not(#get-today)");
      actionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          this.closeAllDatePickers();
        });
      });
    });
  },
  // ui 동작 확인용 테스트 코드
  example() {
    this.datePickerArea.forEach((datePicker) => {
      const year = datePicker.querySelector(".calendar-switch-wrap .year").innerText.slice(0, -1);
      const month = datePicker.querySelector(".calendar-switch-wrap .month").innerText.slice(0, -1);
      const caption = datePicker.querySelector(".calendar-tbl caption");
      const tblCells = datePicker.querySelectorAll(".calendar-tbl td");
      const tblCellBtns = datePicker.querySelectorAll(".calendar-tbl td .btn-set-date");
      const actionBtns = datePicker.querySelectorAll(".calendar-btn-wrap button");
      let clickCount = 0;
      let startTd = null;

      // 캡션 설정
      caption.innerHTML = `${year}년 ${month}월`;

      // 테스트용 (실제 구현에서는 날짜 배열을 받아 처리함)
      tblCells.forEach((cell) => {
        const day = cell.querySelector(".btn-set-date").innerText.padStart(2, "0");
        let [numberYear, numberMonth] = [parseFloat(year), parseFloat(month)];
        if (cell.classList.contains("old")) {
          if (numberMonth === 1) {
            numberYear -= 1;
            numberMonth = 12;
          } else {
            numberMonth -= 1;
          }
        } else if (cell.classList.contains("new")) {
          if (numberMonth === 12) {
            numberYear += 1;
            numberMonth = 1;
          } else {
            numberMonth += 1;
          }
        }
        cell.setAttribute("data-date", `${numberYear}.${String(numberMonth).padStart(2, "0")}.${day}`);
      });

      // action
      const accReset = (action, btn, type) => {
        // 인풋 단일
        const targetInput = btn.closest(".calendar-conts").querySelector("input.datepicker.cal");
        // 인풋 분할
        const targetInputStart = btn.closest(".calendar-conts").querySelector(".input-group.range.set li:first-child input.datepicker");
        const targetInputEnd = btn.closest(".calendar-conts").querySelector(".input-group.range.set li:last-child input.datepicker");

        action.addEventListener("click", () => {
          if (targetInput) {
            targetInput.setAttribute("type", "text");
            const target = action.innerText;
            if (target === "오늘") {
              accSet();
            }
            if (target === "확인") {
              if (type === "single") {
                const value = action.closest(".krds-calendar-area").querySelector("td.period.start.end").getAttribute("data-date");
                targetInput.value = value;
              } else {
                const value1 = action.closest(".krds-calendar-area").querySelector("td.period.start")?.getAttribute("data-date");
                const value2 = action.closest(".krds-calendar-area").querySelector("td.period.end")?.getAttribute("data-date") || "";
                targetInput.value = `${value1} ~ ${value2}`;
              }
            }
          } else {
            targetInputStart.setAttribute("type", "text");
            targetInputEnd.setAttribute("type", "text");
            const target = action.innerText;
            if (target === "오늘") {
              accSet();
            }
            if (target === "확인") {
              const value1 = action.closest(".krds-calendar-area").querySelector("td.period.start")?.getAttribute("data-date");
              const value2 = action.closest(".krds-calendar-area").querySelector("td.period.end")?.getAttribute("data-date") || "";
              targetInputStart.value = value1;
              targetInputEnd.value = value2;
            }
          }
        });
        // 공통 접근성
        const accSet = () => {
          const prevItems = action.closest(".krds-calendar-area").querySelectorAll(".period");
          prevItems.forEach((prev) => {
            prev.classList.remove("period", "start", "end");
            prev.querySelector(".btn-set-date").removeAttribute("aria-pressed");
          });
          action.closest(".krds-calendar-area").querySelector("td.today").classList.add("period", "start", "end");
          action.closest(".krds-calendar-area").querySelector("td.today .btn-set-date").setAttribute("aria-pressed", "true");
        };
      };

      // btn-set-date
      tblCellBtns.forEach((btn) => {
        // disabled 설정
        if (btn.closest("td.new, td.old")) {
          btn.setAttribute("disabled", "true");
        }

        // var
        const isSingle = btn.closest(".calendar-wrap").classList.contains("single");

        if (isSingle) {
          btn.addEventListener("click", () => {
            tblCellBtns.forEach((otherBtn) => {
              otherBtn.closest("td").classList.remove("period", "start", "end");
              otherBtn.removeAttribute("aria-pressed");
            });
            btn.closest("td").classList.add("period", "start", "end");
            btn.setAttribute("aria-pressed", "true");  
          });
          // action
          actionBtns.forEach((action) => {
            accReset(action, btn, "single");
          });
        } else {         
          btn.addEventListener("click", () => {
            const currentTd = btn.closest("td");
            // 현재 td의 날짜
            const currentDate = new Date(currentTd.getAttribute("data-date"));
            // 두 번째 클릭일 때, 시작날짜 이전 이면 초기화
            if (startTd) {
              const startDate = new Date(startTd.getAttribute("data-date"));
              if (currentDate < startDate) {
                console.log("시작날짜 이전은 선택할 수 없습니다.");
                startTd = null;
                clickCount = 0;
                // return;
              }
            }

            clickCount++;

            if (clickCount % 2 === 1) {
              tblCellBtns.forEach((otherBtn) => {
                otherBtn.closest("td").classList.remove("period", "start", "end");
                otherBtn.removeAttribute("aria-pressed");
              });
              btn.closest("td").classList.add("period", "start");
              btn.setAttribute("aria-pressed", "true");
              startTd = currentTd;
            } else {
              btn.closest("td").classList.add("period", "end");
              btn.setAttribute("aria-pressed", "true");
              let started = false;
              tblCellBtns.forEach((otherBtn) => {
                const td = otherBtn.closest("td");
                if (td === startTd) {
                  started = true;
                }
                if (started && td !== currentTd) {
                  td.classList.add("period");
                  otherBtn.setAttribute("aria-pressed", "true");
                }
                if (td === currentTd) {
                  started = false;
                }
              });
              startTd = null;
            }
          });
          // action
          actionBtns.forEach((action) => {
            accReset(action, btn);
          });
        }
      });
    });
  },
};

/*** * krds_inPageNavigation * ***/
const krds_inPageNavigation = {
  quickIndicators: null,
  init() {
    this.quickIndicators = document.querySelectorAll(".krds-in-page-navigation-type .krds-in-page-navigation-area:not(.sample) .in-page-navigation-list");

    if (!this.quickIndicators.length) return;

    this.observeListChanges();
    this.setupAnchorScroll();
    this.updateActiveSection();
  },
  observeListChanges() {
    // in-page-navigation-list 변경 시 setupAnchorScroll 호출
    const quickList = document.querySelector(".krds-in-page-navigation-type .in-page-navigation-list");
    if (!quickList) return;
    const observer = new MutationObserver(() => {
      this.setupAnchorScroll();
    });
    observer.observe(quickList, {
      childList: true,
      subtree: true,
    });
  },
  setupAnchorScroll() {
    this.quickIndicators.forEach((indicator) => {
      const locationList = indicator.querySelectorAll("a");
      locationList.forEach((anchor) => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          anchor.removeEventListener("click", this.applyScroll);
          anchor.removeEventListener("keydown", this.applyScroll);
          anchor.addEventListener("click", this.applyScroll.bind(this, target));
          anchor.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              this.applyScroll(target, event);
            }
          });
        }
      });
    });
  },
  applyScroll(target, event) {
    event.preventDefault();
    const headerHeight = this.calculateHeaderHeight();

    window.scrollTo({
      left: 0,
      top: target.getBoundingClientRect().top + window.scrollY - headerHeight,
      behavior: "smooth",
    });

    // enter 초점 이동
    if (event.type === "keydown") {
      const focusable = target.querySelector(".sec-tit");

      if (focusable) {
        focusable.setAttribute("tabindex", "-1");
        focusable.focus({ preventScroll: true });
      }
    }
  },
  calculateHeaderHeight() {
    const headerTop = document.querySelector("#krds-masthead")?.clientHeight || 0;
    const headerInner = document.querySelector("#krds-header .header-in")?.clientHeight || 0;
    return headerTop + headerInner;
  },
  updateActiveSection() {
    if (!this.quickIndicators) return;

    const winHeight = window.innerHeight;
    let sectionArea = [];
    const activeTab = document.querySelector(".tab-conts:not(.sample).active");

    // 탭이 아닐때와 탭일때 sectionArea 설정
    if (activeTab) {
      const id = activeTab.getAttribute("id");
      const dataTrue = activeTab.getAttribute("data-quick-nav");
      if (dataTrue === "true") {
        sectionArea = document.querySelectorAll(`#${id} .section-link`);
      }
    } else {
      sectionArea = document.querySelectorAll(".scroll-check .section-link");
    }

    //페이지 스크롤 시 퀵 네비게이션 해당메뉴 active
    if (sectionArea.length > 0) {
      const topHeight = Math.ceil(winHeight / 5); // 윈도우의 20%
      const firstSecTop = sectionArea[0].offsetTop;
      const scrollBottom = window.scrollY + winHeight;
      const scrollHeight = document.body.scrollHeight;
      sectionArea.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - topHeight;
        const sectionId = current.getAttribute("id");
        const navLink = document.querySelector(`.krds-in-page-navigation-area a[href*=${sectionId}]`);
        const firstAnchor = document.querySelector(".krds-in-page-navigation-area .in-page-navigation-list li:first-of-type a");
        const lastAnchor = document.querySelector(".krds-in-page-navigation-area .in-page-navigation-list li:last-of-type a");
        if (scrollBottom >= scrollHeight) {
          // 스크롤이 페이지 끝에 도달했을 때
          this.setActiveIndicator(lastAnchor);
        }
        else if (window.scrollY <= firstSecTop) {
          // 스크롤이 첫번째 섹션보다 위에 있을때
          this.setActiveIndicator(firstAnchor);
        } else if (window.scrollY > sectionTop && window.scrollY <= sectionTop + sectionHeight) {
          // 현재 섹션에 있을 때
          this.setActiveIndicator(navLink);
        }
      });
    }
  },
  setActiveIndicator(anchor) {
    if (anchor) {
      this.quickIndicators.forEach((indicator) => {
        const locationList = indicator.querySelectorAll("a");
        locationList.forEach((anchor) => {
          anchor.classList.remove("active");
        });
      });
      anchor.classList.add("active");
    }
  },
};

/*** * krds_helpPanel * ***/
const krds_helpPanel = {
  helpPanel: null,
  lastFocusedButton: null,
  executeButton: null,
  collapseButton: null,
  init() {
    this.helpPanel = document.querySelector(".krds-help-panel");

    if (!this.helpPanel) return;

    this.executeButton = document.querySelectorAll(".btn-help-exec");
    this.collapseButton = this.helpPanel.querySelector(".btn-help-panel.fold");

    this.setupPadding();
    this.observeMastHead();
    this.setupHelpButtons();
    this.toggleScrollLock();
  },
  setupPadding() {
    const topBannerHeight = document.querySelector("#krds-masthead")?.offsetHeight;
    const headerHeight = document.querySelector("#krds-header .header-in")?.offsetHeight;
    const defaultPadding = topBannerHeight + headerHeight;
    const hiddenBannerPadding = headerHeight;

    const expandBox = document.querySelector(".help-panel-wrap");
    const expandButton = document.querySelector(".btn-help-panel.expand");

    const applyPadding = (padding) => {
      expandButton.style.marginTop = padding;
      if (windowSize.getWinSize() === "pc") {
        expandBox.style.paddingTop = padding;
        this.collapseButton.style.marginTop = padding;
      } else {
        expandBox.removeAttribute("style");
        this.collapseButton.removeAttribute("style");
      }
    };

    // bn-hidden: 헤더 배너 숨김, scroll-down: 헤더 숨김
    if (document.body.classList.contains("bn-hidden")) {
      if (document.querySelector("#wrap").classList.contains("scroll-down")) {
        applyPadding("0");
      } else {
        applyPadding(`${hiddenBannerPadding}px`);
      }
    } else {
      applyPadding(`${defaultPadding}px`);
    }
  },
  observeMastHead() {
    const topBanner = document.querySelector("#krds-masthead");
    if (!topBanner) return;
    const body = document.body;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          body.classList.toggle("bn-hidden", !entry.isIntersecting);
        });
      },
      { root: null, threshold: 0 }
    );
    observer.observe(topBanner);
  },
  setupHelpButtons() {
    this.executeButton.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.lastFocusedButton = btn;
        this.toggleHelpPanel("open", btn);
      });
      btn.setAttribute("aria-expanded", "false");
    });
    if (this.collapseButton) {
      this.collapseButton.addEventListener("click", () => {
        this.toggleHelpPanel("close");
      });
    }
  },
  toggleHelpPanel(action, triggerBtn) {
    const helpWrap = document.querySelector(".help-panel-wrap");
    const innerContainer = document.querySelector("#container > .inner");

    if (!helpWrap || !innerContainer || !this.helpPanel) return;

    if (action === "open") {
      if (windowSize.getWinSize() === "mob") {
        document.body.classList.add("scroll-no");
      }

      this.helpPanel.classList.add("expand");
      helpWrap.setAttribute("tabindex", "0");

      if (triggerBtn) {
        setTimeout(() => {
          helpWrap.focus();
        }, 50);
      }

      // 도움패널은 페이지에 한개만 있고 컨트롤하는 버튼은 여러개일때
      this.executeButton.forEach((btn) => {
        btn.setAttribute("aria-expanded", "true");
      });

      // inner가 flexible인 경우
      if (innerContainer.classList.contains("help-panel-flexible")) {
        innerContainer.classList.add("help-panel-expanded");
      }
    } else if (action === "close") {
      if (windowSize.getWinSize() === "mob") {
        document.body.classList.remove("scroll-no");
      }

      this.helpPanel.classList.remove("expand");
      helpWrap.removeAttribute("tabindex");

      if (this.lastFocusedButton) {
        this.lastFocusedButton.focus();
      } else {
        // 처음 부터 오픈일때 지정 버튼으로 포커스 이동
        document.querySelector(".btn-help-panel.expand").focus();
      }

      // 도움패널은 페이지에 한개만 있고 컨트롤하는 버튼은 여러개일때
      this.executeButton.forEach((btn) => {
        btn.setAttribute("aria-expanded", "false");
      });

      // inner가 flexible인 경우
      if (innerContainer.classList.contains("help-panel-flexible")) {
        innerContainer.classList.remove("help-panel-expanded");
      }
    }
  },
  toggleScrollLock() {
    setTimeout(() => {
      if (windowSize.getWinSize() === "mob" && this.helpPanel.classList.contains("expand")) {
        document.body.classList.add("scroll-no");
      } else {
        document.body.classList.remove("scroll-no");
      }
    }, 0);
  },
};

/*** * krds_disclosure * ***/
const krds_disclosure = {
  disclosures: null,
  init() {
    this.disclosures = document.querySelectorAll(".krds-disclosure");

    if (!this.disclosures.length) return;

    this.setupDisclosure();
  },
  setupDisclosure() {
    this.disclosures.forEach((disclosure) => {
      const disclosureButton = disclosure.querySelector(".btn-conts-expand");
      const disclosureContent = disclosure.querySelector(".expand-wrap");
      const uniqueIdx = `disclosure-${Math.random().toString(36).substring(2, 9)}`;

      // 예외 처리: disclosureButton 없이 active 상태를 직접 설정하여 확장 상태를 제어하는 경우
      if (!disclosureButton) return;

      // aria 속성 설정
      disclosureButton.setAttribute("aria-expanded", "false");
      disclosureButton.setAttribute("aria-controls", uniqueIdx);
      disclosureContent.setAttribute("id", uniqueIdx);
      // disclosureContent.setAttribute("aria-hidden", "true"); // 임시: disclosure 내용이 일부만 노출되는 경우
      disclosureContent.setAttribute("inert", "");
      if (disclosure.classList.contains("active")) {
        disclosureButton.setAttribute("aria-expanded", "true");
        // disclosureContent.setAttribute("aria-hidden", "false"); // 임시: disclosure 내용이 일부만 노출되는 경우
        disclosureContent.removeAttribute("inert");
      }

      disclosureButton.addEventListener("click", () => {
        this.toggleDisclosure(disclosure, disclosureButton, disclosureContent);
      });
    });
  },
  toggleDisclosure(disclosure, disclosureButton, disclosureContent) {
    const isExpanded = disclosureButton.getAttribute("aria-expanded") === "true";

    disclosure.classList.toggle("active", !isExpanded);
    disclosureButton.setAttribute("aria-expanded", !isExpanded);

    // disclosureContent.setAttribute("aria-hidden", isExpanded); // 임시: disclosure 내용이 일부만 노출되는 경우
    if (isExpanded) {
      disclosureContent.setAttribute("inert", "");
    } else {
      disclosureContent.removeAttribute("inert");
    }
  },
};

/*** * krds_adjustContentScale * ***/
const krds_adjustContentScale = {
  body: document.body,
  scaleLevel: 1,
  minScale: 0.5,
  maxScale: 2,
  init() {
    const scaleButtons = document.querySelectorAll("[data-adjust] [data-adjust-scale]");

    if (!scaleButtons.length) return;

    // root 변수에서 스케일 값을 가져오기
    const root = document.querySelector(":root");
    const rootStyles = getComputedStyle(root);
    const zoomSmall = rootStyles.getPropertyValue("--krds-zoom-small").trim();
    const zoomMedium = rootStyles.getPropertyValue("--krds-zoom-medium").trim();
    const zoomLarge = rootStyles.getPropertyValue("--krds-zoom-large").trim();
    const zoomXlarge = rootStyles.getPropertyValue("--krds-zoom-xlarge").trim();
    const zoomXxlarge = rootStyles.getPropertyValue("--krds-zoom-xxlarge").trim();

    scaleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const scale = button.getAttribute("data-adjust-scale");
        switch (scale) {
          case "sm":
            this.scaleValue(zoomSmall);
            break;
          case "md":
            const others = button.closest(".drop-menu").querySelectorAll(".item-link");
            const defaultSize = button.closest(".drop-menu").querySelector(".item-link.md");
            others.forEach((item) => {
              item.classList.remove("active");
              item.setAttribute("aria-selected", "false");
              item.querySelector(".sr-only").innerHTML = "";
            });
            defaultSize.classList.add("active");
            defaultSize.querySelector(".sr-only").innerHTML = "선택됨";
            this.scaleValue(zoomMedium);
            break;
          case "lg":
            this.scaleValue(zoomLarge);
            break;
          case "xlg":
            this.scaleValue(zoomXlarge);
            break;
          case "xxlg":
            this.scaleValue(zoomXxlarge);
            break;
          default:
            break;
        }
      });
    });
  },
  scaleValue(value) {
    this.scaleLevel = value;
    this.body.style.zoom = this.scaleLevel;
  },
  scaleDefault() {
    this.scaleLevel = 1;
    this.body.style.zoom = this.scaleLevel;
  },
  scaleMin() {
    this.scaleLevel = this.minScale;
    this.body.style.zoom = this.scaleLevel;
  },
  scaleMax() {
    this.scaleLevel = this.maxScale;
    this.body.style.zoom = this.scaleLevel;
  },
  scaleUp() {
    if (this.scaleLevel < this.maxScale) {
      this.scaleLevel += 0.1;
      if (this.scaleLevel > this.maxScale) this.scaleLevel = this.maxScale;
      this.body.style.zoom = this.scaleLevel;
    }
  },
  scaleDown() {
    if (this.scaleLevel > this.minScale) {
      this.scaleLevel -= 0.1;
      if (this.scaleLevel < this.minScale) this.scaleLevel = this.minScale;
      this.body.style.zoom = this.scaleLevel;
    }
  },
};

/*** * krds_toggleSwitch * ***/
const krds_toggleSwitch = {
  init() {
    const toggleSwitch = document.querySelectorAll(".krds-form-toggle-switch");

    if (!toggleSwitch.length) return;

    toggleSwitch.forEach((toggle) => {
      const input = toggle.querySelector("input");
      if (!input) return;
      input.addEventListener("focus", () => {
        toggle.classList.add("focus");
      });
      input.addEventListener("focusout", () => {
        toggle.classList.remove("focus");
      });
    });
  },
};

/*** * krds_infoList * ***/
const krds_infoList = {
  init() {
    const infoLists = document.querySelectorAll(".krds-info-list");

    if (!infoLists.length) return;

    infoLists.forEach((list) => {
      list.setAttribute("role", "list");
      const listItems = list.querySelectorAll("li");
      listItems.forEach((item) => {
        item.setAttribute("role", "listitem");
      });
    });
  },
};

/*** * krds_dropEvent(gnb utils / page-title-wrap) * ***/
const krds_dropEvent = {
  dropButtons: null,
  init() {
    this.dropButtons = document.querySelectorAll(".krds-drop-wrap:not(.sample) .drop-btn");

    if (!this.dropButtons.length) return;

    this.setupEventListeners();
    this.setupFocusOutEvent();
  },
  setupEventListeners() {
    this.dropButtons.forEach((button) => {
      const menu = button.nextElementSibling;
      button.setAttribute("aria-expanded", "false");

      button.addEventListener("click", () => {
        const isOpen = menu.style.display === "block";
        this.closeAllDropdowns();
        if (!isOpen) {
          this.openDropdown(button, menu);
        }
      });

      this.setupMenuItems(menu);
    });
  },
  setupMenuItems(menu) {
	if (!menu) return; // ← null 체크 추가
    const items = menu.querySelectorAll(".item-link");

    items.forEach((item) => {
      item.innerHTML += `<span class="sr-only"></span>`;
      if (item.classList.contains("active")) {
        item.querySelector(".sr-only").innerHTML = "선택됨";
      }

      item.addEventListener("click", () => {
        this.activateMenuItem(item);
        this.closeAllDropdowns();
        const button = item.closest(".krds-drop-wrap").querySelector(".drop-btn");
        button?.focus();
      });

      item.addEventListener("focus", () => {
        document.querySelectorAll(".krds-drop-wrap .drop-list .item-link").forEach((item) => {
          item.style.position = "relative";
          item.style.zIndex = "0";
        });
        item.style.zIndex = "1";
      });
    });
  },
  activateMenuItem(selectedItem) {
    const menu = selectedItem.closest(".drop-menu");
    const items = menu.querySelectorAll(".item-link");

    items.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
      item.querySelector(".sr-only").innerText = "";
    });

    selectedItem.classList.add("active");
    selectedItem.setAttribute("aria-selected", "true");
    selectedItem.querySelector(".sr-only").innerText = "선택됨";
  },
  openDropdown(button, menu) {
    menu.style.display = "block";
    button.classList.add("active");
    button.setAttribute("aria-expanded", "true");

    // 여백에 따라 위치 조정
    const menuRect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    if (menuRect.left < 0) {
      menu.closest(".krds-drop-wrap").classList.add("drop-left");
    } else if (windowWidth < menuRect.left + menuRect.width) {
      menu.closest(".krds-drop-wrap").classList.add("drop-right");
    }

  },
  closeAllDropdowns() {
    document.querySelectorAll(".krds-drop-wrap .drop-menu").forEach((menu) => {
      menu.style.display = "none";
    });
    this.dropButtons.forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-expanded", "false");
    });
  },
  setupFocusOutEvent() {
    // ESC 닫기
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" || event.key === "Esc") {
        this.closeAllDropdowns();
        event.target.closest(".krds-drop-wrap")?.querySelector(".drop-btn")?.focus();
      }
    });

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".krds-drop-wrap")) {
        this.closeAllDropdowns();
      }
    });

    // 드롭다운 포커스 아웃 처리
    this.dropButtons.forEach((button) => {
      const menu = button.nextElementSibling;

      if (!menu) return;

      // 드롭다운 메뉴의 포커스 아웃 처리
      menu.addEventListener("focusout", (event) => {
        const isFocusInside = menu.contains(event.relatedTarget) || button.contains(event.relatedTarget);
        if (!isFocusInside) {
          this.closeAllDropdowns();
        }
      });

      // 버튼의 포커스 아웃 처리
      button.addEventListener("focusout", (event) => {
        const isFocusInside = menu.contains(event.relatedTarget) || button.contains(event.relatedTarget);
        if (!isFocusInside) {
          this.closeAllDropdowns();
        }
      });
    });
  },
};

/*** * krds_chkBox 박스형 체크박스 상태에 따른 디자인 변경 * ***/
const krds_chkBox = {
  init() {
    const box = document.querySelectorAll(".chk-group-wrap");
    box.forEach((e) => {
      const boxList = e.querySelectorAll("li");
      boxList.forEach((ele) => {
        ele.removeAttribute("class");
        const thisList = ele.closest("li");
        const checkbox = ele.querySelector("input[type=checkbox]");
        if (checkbox != null) {
          const is_disabled = checkbox.disabled;
          let is_checked = checkbox.checked;

          if (is_disabled == true) {
            thisList.classList.add("disabled");
          } else {
            if (is_checked == true) {
              thisList.classList.add("checked");
            }
          }

          checkbox.addEventListener("click", () => {
            if (is_checked == true) {
              thisList.classList.remove("checked");
              is_checked = false;
            } else {
              thisList.classList.add("checked");
              is_checked = true;
            }
          });
        }

        const rdo = ele.querySelector("input[type=radio]");
        if (rdo != null) {
          const is_disabled = rdo.disabled;
          let is_checked = rdo.checked;

          if (is_disabled == true) {
            thisList.classList.add("disabled");
          } else {
            if (is_checked == true) {
              thisList.classList.add("checked");
            }
          }

          rdo.addEventListener("click", (e) => {
            const rdoGroup = rdo.closest(".chk-group-wrap");
            const rdoLi = rdoGroup.querySelectorAll("li");
            let is_checked2 = e.checked;
            rdoLi.forEach((ele) => {
              ele.classList.remove("checked");
              is_checked2 = false;
            });
            if (is_checked2 == true) {
              thisList.classList.remove("checked");
              is_checked2 = false;
            } else {
              thisList.classList.add("checked");
              is_checked2 = true;
            }
          });
        }
      });
    });

    this.formChipFocus();
  },
  formChipFocus() {
    // form_chip 일때 포커스 처리
    const formChip = document.querySelectorAll(".krds-form-chip");

    if (!formChip.length) return;
    
    formChip.forEach((chip) => {
      const input = chip.querySelector("input");
      if (!input) return;
      input.addEventListener("focus", () => {
        chip.classList.add("focus");
      });
      input.addEventListener("focusout", () => {
        chip.classList.remove("focus");
      });
    });

  },
};

/*** * krds_fileUpload 파일 업로드 : drag 임시 * ***/
const krds_fileUpload = {
  init() {
    const fileUploads = document.querySelectorAll(".file-upload");
    fileUploads.forEach((fileUpload) => {
      const inputFile = fileUpload.querySelector('input[type="file"]');
      const inputButton = fileUpload.querySelector("button");

      inputButton.addEventListener("click", () => {
        inputFile.click();
      });

      fileUpload.addEventListener("dragover", (e) => {
        fileUpload.classList.add("active");
        e.preventDefault();
      });

      fileUpload.addEventListener("dragleave", (e) => {
        fileUpload.classList.remove("active");
        e.preventDefault();
      });

      fileUpload.addEventListener("drop", (e) => {
        fileUpload.classList.remove("active");
        e.preventDefault();
        // const files = e.dataTransfer.files;
      });
    });
  },
};

/*** * nuriToggleEvent 누리집 토글 이벤트 현재는 사용 안 함 * ***/
const nuriToggleEvent = {
  init() {
    const _toggleBtns = document.querySelectorAll("#krds-masthead .toggle-btn");
    _toggleBtns.forEach(($toggleBtn) => {
      $toggleBtn.addEventListener("click", ($btnAct) => {
        const $target = $btnAct.target.closest(".toggle-head");
        const $targetBody = $target.nextElementSibling;
        const _targetBodyH = $targetBody.querySelector(".inner").scrollHeight;
        const $srEl = $btnAct.target.querySelector(".sr-only");

        if (!$target.classList.contains("active")) {
          $srEl.innerText = "닫힘";
          $target.classList.add("active");
          $targetBody.classList.add("active");
          $targetBody.style.height = `${_targetBodyH}px`;
          window.addEventListener("resize", () => {
            if ($targetBody.classList.contains("active")) {
              const _targetBodyH = $targetBody.querySelector(".inner").scrollHeight;
              $targetBody.style.height = `${_targetBodyH}px`;
            }
          });
        } else {
          $srEl.innerText = "열림";
          $target.classList.remove("active");
          $targetBody.classList.remove("active");
          $targetBody.style.height = "";
        }
      });
    });
  },
};

/*** * krds_tts * ***/
const krds_tts = {
  speechSynthesis: null,
  activeButton: null,
  
  init() {
    this.speechSynthesis = window.speechSynthesis;
    // Chrome에서 voices 초기화 트리거(비동기 로드되더라도 speak는 지연 없이 호출해야 함)
    try {
      this.speechSynthesis && this.speechSynthesis.getVoices();
    } catch (e) {}
    
    const ttsButtons = document.querySelectorAll(".krds-tts:not([disabled]):not(.disabled)");
    
    ttsButtons.forEach((button) => {
      button.setAttribute("aria-pressed", "false");
      // onclick이 없으면 이벤트 리스너 추가
      if (!button.getAttribute("onclick")) {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          const text = button.getAttribute("data-tts-text");
          if (text) {
            this.toggle(button, text);
          }
        });
      }
    });
  },
  
  toggle(button, text) {
    const isPlaying = button.classList.contains("is-playing");
    
    if (isPlaying) {
      this.stop(button);
    } else {
      this.play(button, text);
    }
  },
  
  play(button, text) {
    if (!text || text.trim() === '') return;
    if (!this.speechSynthesis) return;
    
    // 다른 버튼이 재생 중이면 멈춤
    if (this.activeButton && this.activeButton !== button) {
      this.stop(this.activeButton);
    }
    
    // 상태 업데이트
    const isPlayType = button.classList.contains("play");
    if (isPlayType) {
      this.changeToPause(button);
    }
    
    button.classList.add("is-playing");
    button.setAttribute("aria-pressed", "true");
    this.activeButton = button;
    this.updateText(button, "멈춤");
    
    // TTS 재생
    this.speak(text, button);
  },
  
  stop(button) {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    
    button.classList.remove("is-playing");
    button.setAttribute("aria-pressed", "false");
    
    // Play 타입이었던 경우 원래대로 복원
    if (button.classList.contains("pause") && button.dataset.wasPlayType === "true") {
      this.changeToPlay(button);
    }
    
    this.updateText(button, "재생");
    
    if (this.activeButton === button) {
      this.activeButton = null;
    }
  },
  
  speak(text, button) {
    if (!this.speechSynthesis) return;
    // Chrome: user gesture 안에서 speak가 실행되어야 해서 지연 호출(setTimeout 등) 금지
    if (this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
    }
    this.startUtterance(text, button);
  },
  
  startUtterance(text, button) {
    if (!this.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Chrome에서는 lang/voice 타이밍 이슈가 있어 강제 설정은 최소화
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // 가능한 경우에만 ko 음성/언어 적용 (없으면 브라우저 기본으로 진행)
    try {
      const voices = this.speechSynthesis.getVoices?.() || [];
      const ko = voices.find((v) => (v.lang || "").toLowerCase().startsWith("ko"));
      if (ko) {
        utterance.lang = "ko-KR";
        utterance.voice = ko;
      }
    } catch (e) {}

    utterance.onend = () => {
      if (this.activeButton === button) {
        this.stop(button);
      }
    };

    utterance.onerror = (event) => {
      // canceled는 사용자/코드 cancel()로 정상 발생 가능
      if (event.error !== "canceled" && this.activeButton === button) {
        this.stop(button);
      }
    };

    try {
      // Chrome 우회: 같은 클릭 제스처 안에서 cancel/resume/speak를 한 번에 수행
      // (비동기 지연은 user-gesture를 깨서 무음이 될 수 있어 사용하지 않음)
      this.speechSynthesis.cancel();
      if (this.speechSynthesis.paused) this.speechSynthesis.resume();
      this.speechSynthesis.speak(utterance);
      // 일부 Chrome에서 speak 직후 resume이 필요할 때가 있음
      if (this.speechSynthesis.paused) this.speechSynthesis.resume();
    } catch (error) {
      if (this.activeButton === button) {
        this.stop(button);
      }
    }
  },
  
  changeToPause(button) {
    if (!button.dataset.wasPlayType) {
      button.dataset.wasPlayType = "true";
    }
    button.classList.remove("play");
    button.classList.add("pause");
    const icon = button.querySelector(".krds-tts-icon .svg-icon");
    if (icon) {
      icon.classList.remove("ico-play");
      icon.classList.add("ico-stop");
    }
  },
  
  changeToPlay(button) {
    button.classList.remove("pause");
    button.classList.add("play");
    const icon = button.querySelector(".krds-tts-icon .svg-icon");
    if (icon) {
      icon.classList.remove("ico-stop");
      icon.classList.add("ico-play");
    }
    delete button.dataset.wasPlayType;
  },
  
  updateText(button, newText) {
    const textElement = button.querySelector(".krds-tts-text");
    if (!textElement) return;
    
    // 원래 텍스트 저장 (처음 한 번만)
    if (!textElement.dataset.originalText) {
      textElement.dataset.originalText = textElement.textContent.trim();
    }
    
    // 원래 텍스트가 "재생"인 경우만 변경
    const originalText = textElement.dataset.originalText;
    if (originalText === "재생") {
      textElement.textContent = newText === "멈춤" ? "멈춤" : "재생";
    }
  },
};

// 전역 함수: onclick에서 사용
// 사용법: onclick="krds_playTts('읽을 내용', this)"
window.krds_playTts = function(text, buttonElement) {
  if (!text || text.trim() === '') return;
  // 최소 진단(Chrome 무음 원인 확정용): voices가 0이면 환경/로딩 문제 가능성 큼
  try {
    if (window.speechSynthesis) {
      console.log("[krds-tts] protocol:", location.protocol, "voices:", window.speechSynthesis.getVoices().length);
    }
  } catch (e) {}
  
  // buttonElement 찾기
  if (!buttonElement) {
    const event = window.event || (typeof event !== 'undefined' ? event : null);
    if (event) {
      buttonElement = event.currentTarget || event.target?.closest('.krds-tts');
    }
    if (!buttonElement) {
      buttonElement = document.activeElement;
    }
  }
  
  if (!buttonElement || !buttonElement.classList.contains("krds-tts")) return;
  
  // aria-pressed 초기값 설정
  if (!buttonElement.hasAttribute("aria-pressed")) {
    buttonElement.setAttribute("aria-pressed", "false");
  }
  
  // 재생/멈춤 토글
  const isPlaying = buttonElement.classList.contains("is-playing");
  if (isPlaying) {
    krds_tts.stop(buttonElement);
  } else {
    krds_tts.play(buttonElement, text);
  }
};

// 초기 이벤트
window.addEventListener("DOMContentLoaded", () => {
  // 윈도우 사이즈 체크
  windowSize.setWinSize();

  krds_mainMenuPC.init();
  krds_mainMenuMobile.init();
  krds_sideNavigation.init();
  krds_tab.init();
  krds_accordion.init();
  krds_modal.init();
  krds_contextualHelp.init();
  krds_tooltip.init();
  krds_disclosure.init();
  krds_dropEvent.init();
  krds_calendar.init();
  krds_inPageNavigation.init();
  krds_adjustContentScale.init();
  krds_toggleSwitch.init();
  krds_infoList.init();
  krds_chkBox.init();
  krds_fileUpload.init();
  krds_tts.init();

  krds_helpPanel.init();
  if (windowSize.getWinSize() === "pc") {
    krds_helpPanel.toggleHelpPanel("open");
  }
});

// 스크롤 이벤트
window.addEventListener("scroll", () => {
  scrollManager.updateScrollValues();
  scrollManager.handleScrollDirection();

  krds_mainMenuPC.closeMainMenu();
  krds_inPageNavigation.updateActiveSection();
  krds_helpPanel.init();
});

// 리사이즈 이벤트
window.addEventListener("resize", () => {
  windowSize.setWinSize();
  krds_helpPanel.init();
});

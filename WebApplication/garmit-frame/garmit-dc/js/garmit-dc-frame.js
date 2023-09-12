var garmitFrame;
(
  function ($) {
    garmitFrame = {
      $body : $('body'),
      $sidebar: $('.main-sidebar, .alarm-sidebar'),
      $rootContainer : $('#rootContainer'),
      $window: $(window),
      closeTimer: null,
      isAnimated: false,
      sidebarLength: false,
      intervalId: null,
      toastOptions: {
        showHideTransition : 'fade',
        allowToastClose : true, 
        loaderBg: '#ccc',
        hideAfter : 5000,
        stack : 10,
        position : 'top-right'
      },
      mainBarOpen: function () {
        var frame = this;
        this.activateMenuHoverAction();
        this.mainBarScrollToTop();
        this.$rootContainer.addClass('main-sidebar--open');
        if (frame.closeTimer) {
          clearTimeout(frame.closeTimer);
        }
        frame.closeTimer = setTimeout(frame.closeAllBalloons, 500);
      },
      mainBarClose: function () {
        this.$rootContainer.removeClass('main-sidebar--open');
      },
      alarmBarOpen: function () {
        this.alarmBarScrollToTop();
        this.collapseToast();
        this.$rootContainer.addClass('alarm-sidebar--open');
      },
      alarmBarClose: function () {
        this.$rootContainer.removeClass('alarm-sidebar--open');
      },
      disableBodyScroll: function () {
        var scrollBarWidth = window.innerWidth - this.$window.width();

        $('.content-wrapper').css({
          'margin-right' : scrollBarWidth + 'px'
        });
        $('.main-header:after').css({
          'padding-right' : scrollBarWidth + 'px'
        });
        this.$.body.css({
            top: -this.$window.scrollTop(),
            position: 'fixed',
            width: '100%'
        });
      },
      enableBodyScroll: function () {
        var t = -garmitFrame.$body.offset().top;
        garmitFrame.$body.css({
            position: '',
            top: '',
            width: '',
        });
        $('.content-wrapper').css({
          'margin-right' : 0
        });
        $('.main-header:after').css({
          'padding-right' : 0
        });
        this.$window.scrollTop(t);
      },
      closeAllBalloons: function () {
        $('.gnav-parent').removeClass('gnav-parent--active');
      },
      collapseToast: function (selector) {
        if (!selector) {
          selector = '.alarm-sidebar .toast';
        }
        $(selector).each(function () {
          var $toast = $(this);
          var $action = $toast.find('.toast-action');
          if ($action.length) {
            if (!$action.find('.toast-action-inner').length) {
              $action.wrapInner('<div class="toast-action-inner"></div>');
            }
            $toast.addClass('toast-with-action toast-collapsed').find('.toast-action-inner').hide();
          }
        });
      },
      collapseNewToast: function () {
        this.collapseToast('.alarm-sidebar .toast:not(.toast-with-action)');
      },
      controlSidebarFooter: function () {
        if ($('.main-sidebar__help').offset().top + $('.main-sidebar__help').outerHeight() - 20 > $('.sidebar-footer').offset().top) {
          $('.sidebar-footer').addClass('sidebar-footer--hidden');
        } else {
          $('.sidebar-footer').removeClass('sidebar-footer--hidden');
        }
      },
      toast: function (toastSection, option) {
        if ($.toast) {
          var $toastSection = $(toastSection);
          var toastOptions = this.toastOptions;

          this.removeBodyToastClass();

          if (typeof option === 'object') {
            $.extend(toastOptions, option);
          }
          toastOptions.text = toastSection;
          var afterHiddenCallback = toastOptions.afterHidden;
          toastOptions.afterHidden = function (toast) {
            if (!$('.jq-toast-wrap .toast:visible').length) {
              garmitFrame.removeBodyToastClass();
            }
            if (typeof afterHiddenCallback === 'function') {
              afterHiddenCallback(toast);
            }
          }
          $.toast(toastOptions);
          $(['error', 'warn', 'syserr']).each(function (i, elem) {
            if ($toastSection.hasClass('toast-' + elem)) {
              garmitFrame.$body.addClass('toast-' + elem + '--activated');
            }
          });
        }
      },
      activateMenuHoverAction: function () {
        this.deactivateMenuHoverAction();
        $('.gnav-parent').hover(function() {
          var $parent = $(this);
          var $child = $parent.find('.gnav-child');
          $parent.addClass('gnav-parent--active');

          var parentTop = $parent.offset().top;
          var topMinValue = $('.gnav li').eq(0).offset().top;
          var childTop = Math.max(($parent.height() - $child.height()) / 2, topMinValue - parentTop - $parent.height() / 5);
          $child.css('top', childTop);
        }, function() {
          var $parent = $(this);
          $parent.removeClass('gnav-parent--active');
        });

        $('.main-sidebar__help').hover(function () {
          $(this).addClass('main-sidebar__help--active');
        }, function () {
          $(this).removeClass('main-sidebar__help--active');
        });

      },
      deactivateMenuHoverAction: function () {
        $('.gnav-parent, .main-sidebar__help').off( "mouseenter mouseleave" );
      },

      setDefaultToastOptions: function (option) {
        this.toastOptions = $.extend(this.toastOptions, option);
      },
      removeBodyToastClass: function () {
        garmitFrame.$body.removeClass('toast-error--activated toast-warn--activated toast-syserr--activated');
      },
      mainBarScrollToTop: function () {
        $('.main-sidebar .sidebar').mCustomScrollbar('scrollTo', 0);
      },
      alarmBarScrollToTop: function () {
        $('.alarm-sidebar__inner').mCustomScrollbar('scrollTo', 0);
      },
      sidebarExists: function() {
        if (this.sidebarLength === false) {
          this.sidebarLength = this.$sidebar.length;
        }
        return this.sidebarLength > 0;
      },
      showLoading: function () {
        if (!$('.garmit-loading').length) {
          this.$body.prepend('<div class="garmit-loading"><div class="garmit-spinner"></div></div>');
        }
      },
      hideLoading: function () {
        $('.garmit-spinner').hide();
      },
      adjustScrollPane: function () {
        var dispatcher = [];
        $('.scroll-pane').each(function () {
          var $pane = $(this);
          if (!$pane.children().hasClass('scroll-pane-inner')) {
            $pane.wrapInner('<div class="scroll-pane-inner"></div>');
          }
          var top = $pane.offset().top, ph = top + $pane.children('.scroll-pane-inner').height();
          var wh = garmitFrame.$window.height();
          var ww = garmitFrame.$window.width();
          var sizes = { sm: 768, md: 992, lg: 1200 };
          var min = 0
          for (key in sizes) {
            if ($pane.hasClass('scroll-pane-'+key)) {
              min = sizes[key];
            }
          }
          if (top > wh) {
            dispatcher = false;
            return false;
          }
          if (ph > wh && ww >= min) {
            dispatcher.push(function () {
              $pane.css({overflowY: 'scroll', height: wh - top});
            });
          } else {
            $pane.css({overflowY: '', height: ''});
          }
        });
        if (dispatcher) {
          $('.scroll-pane').removeClass('scroll-pane-disabled');
          // $('body').css('overflow', 'hidden');
          $(dispatcher).map(function (i, f) { f() });
          
        } else {
          // $('body').css('overflow', '');
          $('.scroll-pane').addClass('scroll-pane-disabled');
        }
      },
      initSearchBox: function () {
        garmitFrame.$body.off('inview', '.box-search');
        $('.box-search-ghost').remove();
        if ($('.box-search').length) {
          garmitFrame.$body.on('inview', '.box-search', function (event, inView) {
            if (inView) {
              $('.box-search-ghost').remove();
            } else {
              garmitFrame.$body.append('<div class="box-search-ghost"><i class="fal fa-search"></i> 検索条件に戻る</div>');
              $('.box-search-ghost').css({left: $(this).offset().left, opacity: 1});
            }
          }); 
        }
      },
      refresh: function () {
        if (this.intervalID) {
          clearInterval(this.intervalID);
        }
        if ($('.scroll-pane').length) {
          this.intervalID = setInterval(this.adjustScrollPane, 400);
        } else {
          // $('body').css('overflow', '');
        }
        this.initSearchBox();
      }
    }

    $(function () {
      var clickEvent = ('ontouchstart' in window) ? 'touchstart click' : 'click';

      $('.main-header__logo-image').on(clickEvent, function (e) {
        e.stopPropagation();
        garmitFrame.mainBarOpen();
        garmitFrame.alarmBarClose();
      });

      $('.main-header__page-title-text').on(clickEvent, function (e) {
        $('html,body').animate({scrollTop:0}, 500, 'swing');
      });

      $('.main-header__alarm-text').on(clickEvent, function (e) {
        e.stopPropagation();
        garmitFrame.mainBarClose();
        garmitFrame.alarmBarOpen();
        return false;
      });

      $('.main-sidebar__title').on(clickEvent, function (e) {
        e.stopPropagation();
        garmitFrame.mainBarClose();
        return false;
      });

      $('.alarm-sidebar__close, .alarm-sidebar--close').on(clickEvent, function (e) {
        e.stopPropagation();
        garmitFrame.alarmBarClose();
      });

      garmitFrame.$body.on('click trigger-action', '.box-collapsible .box-header', function (e) {
        var $box = $(this).closest('.box');
        var $boxCollapsibleElement = $box.find('.box-body, .box-footer');
        if ($box.hasClass('collapsed-box')) {
          $box.removeClass('collapsing-box collapsed-box');
          $boxCollapsibleElement.slideDown();
        } else {
          $box.addClass('collapsing-box');
          $boxCollapsibleElement.slideUp(function () {
            $box.removeClass('collapsing-box').addClass('collapsed-box');
          });
        }
      });
      $('.box-collapsible.collapsed-box').find('.box-body, .box-footer').hide();

      garmitFrame.$body.on(clickEvent, '.box-collapsible .box-header .btn, .box-collapsible .box-header .no-collapse', function (e) {
        e.stopPropagation();
      });

      garmitFrame.$body.on(clickEvent, '.content-wrapper,.main-header', function (e) {
        garmitFrame.mainBarClose();
        garmitFrame.alarmBarClose();
      });

      if (garmitFrame.sidebarExists()) {
        $('.main-sidebar .sidebar, .alarm-sidebar__inner').mCustomScrollbar({
          axis: 'y',
          autoHideScrollbar: true,
          scrollInertia: 20,
          callbacks:{
            whileScrolling: function() {
              garmitFrame.controlSidebarFooter();
            }
          }
        });
      }

      $('.alarm-sidebar').on(clickEvent, '.toast-with-action', function (e) {
          if (!$(e.target).hasClass('btn')) {
            $(this).toggleClass('toast-collapsed');
            $(this).find('.toast-action-inner').slideToggle('fast');
          }
      });

      garmitFrame.$body.on('click', '.box-search-ghost', function () {
        $('html,body').animate({scrollTop:0}, 500, 'swing', function () {
          var $searchBox = $('.box-search');
          if ($searchBox.hasClass('collapsed-box')) {
            $searchBox.find('.box-header').trigger('trigger-action');
          }
        });
      });

      if (garmitFrame.sidebarExists()) {
        garmitFrame.$window.resize(function () {
          garmitFrame.controlSidebarFooter();
          garmitFrame.adjustScrollPane();
        });
      }
      garmitFrame.$body.addClass('garmit-ready');
      garmitFrame.refresh();
    });
  }
)(jQuery);
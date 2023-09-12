var garmitFrame;
(
  function ($) {
    garmitFrame = {
      $body : $('body'),
      $sidebar: $('.main-sidebar, .alarm-sidebar'),
      $rootContainer : $('#rootContainer'),
      closeTimer: null,
      isAnimated: false,
      sidebarLength: false,
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
        var scrollBarWidth = window.innerWidth - $(window).width();

        $('.content-wrapper').css({
          'margin-right' : scrollBarWidth + 'px'
        });
        $('.main-header:after').css({
          'padding-right' : scrollBarWidth + 'px'
        });
        this.$.body.css({
            top: -$(window).scrollTop(),
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
        $(window).scrollTop(t);
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

      garmitFrame.$body.on(clickEvent, '.content-wrapper,.main-header', function (e) {
        garmitFrame.mainBarClose();
        garmitFrame.alarmBarClose();
      });
/*
      garmitFrame.$body.on(clickEvent, '.garmit-loading', function (e) {
        garmitFrame.showLoading();
      });
*/
      //var $sideBar = $('.main-sidebar .sidebar, .alarm-sidebar__inner');
      //new SimpleBar($('.main-sidebar .sidebar')[0]);
      //new SimpleBar($('.alarm-sidebar__inner')[0]);
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

      if (garmitFrame.sidebarExists()) {
        $(window).resize(function () {
          garmitFrame.controlSidebarFooter();
        });
      }
      garmitFrame.$body.addClass('garmit-ready');
    });
  }
)(jQuery);

/*
 * Miscellanious jQuery functionality
 */
define(function (require) {
    var _ = require('underscore'),
      $ = require('jquery'),
      v = require('app/utils/variables'),
      Backbone = require('backbone');

  //Check for long synopsis and make it shorter
  shortSynopsis = function () {
    var moreText = "More »",
      hideDesc = '<div class="hide-description overflow"><a href="#" class="more">More »</a></div>',
      $desc = $('.description'),
      height = $('.more-block').height();

    if (height > 200) {
      $desc.append(hideDesc);
      $('.more-block').addClass('shorten');

      $('.more').on('click', function (e) {
        e.preventDefault();
        var buttonTxt = $('.more').text() == "More »" ? "« Less" : "More »";

        $desc.find(".more-block").toggleClass('long');
        $(".hide-description").toggleClass('overflow');
        $('.more').text(buttonTxt).toggleClass('less');
      });
    }
  };

/*
  topicsForm = function () {
    var $topics = $('.topics input');

    $topics.change(function() {
      if($(this).is(":checked")) {
        console.log(this);
      }
    });
    _.each($topics, function(topic) { 
      console.log(topic);
    }); 
  }; */


  return {
    shortSynopsis: shortSynopsis
  };
});
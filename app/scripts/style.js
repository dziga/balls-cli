$(document).ready(function () {

  FE.onPageLoad();

  $('.navbar-toggle').trigger('click');

  $('#input_name').focus();

  $('a.menu-item').click(function(e){
    e.preventDefault();
  })

  $('#button_main_ok').click(function() {
    var name = $("#input_name").val();
    $('#button_main_ok').addClass("disabled");
    FE.requestAuthentication(name);
  });

  $('#button_main_edit').click(function() {
    var name = $("#set_name").val();
    FE.setName(name);
    $('#name_display').text(' '+name);
  });

  $('#input_name').on("keypress", function(event) {
    if (event.keyCode === 13 && $("#input_name").val().length > 0){
      $('#button_main_ok').trigger('click');
    }
  });

  $('#modal_players').on('shown.bs.modal', function () {
    $('#button_players').focus()
  });

  $('#button_main_bot').click(function(){
    $('body').toggleClass("background-color");
    $('#main_connected').hide();
    $('#screen_game').show();
    FE.joinBot();
  });

  $('#exit_game_button').click(function(){
    $('#screen_game').hide();
    $('#main_connected').show();
    $('body').toggleClass("background-color");
    $('#game_chat_container').text('');
    FE.mainMenu();
    $('#button_main_join').prop('disabled', false);
    $('#button_main_bot').prop('disabled', false);
    $('#button_main_host').children().first().text('Host');
  });

  $('#back_to_lobby_button').click(function(){
    $('#screen_game').hide();
    $('#main_connected').show();
    $('body').toggleClass("background-color");

    $('#button_main_join').prop('disabled', false);
    $('#button_main_bot').prop('disabled', false);
    $('#button_main_host').children().first().text('Host');
    FE.mainMenu();
  });

  $('#button_main_host').click(function() {
    var hosting = FE.hostMenu();
    if (!hosting) {
      $('#button_main_join').prop('disabled', true);
      $('#button_main_bot').prop('disabled', true);
      $('#button_main_host').children().first().text('Stop Hosting');
    } else {
      $('#button_main_join').prop('disabled', false);
      $('#button_main_bot').prop('disabled', false);
      $('#button_main_host').children().first().text('Host');
    }
  });

  $('#checkbox_main_playsound').click(function(){
    $(this).find('span').toggleClass("glyphicon-volume-up glyphicon-volume-off");
  })

  $('#button_main_send, #button_game_send').click(function(){
    var input;
    if ($("#input_game_chat:visible").length) {
        input = $("#input_game_chat");
    } else {
        input = $("#input_main_chat");
    }
    var message = input.val();
    if (message != "") {
        input.val("");
        FE.sendChatMessage(message);
    }
  });

  $('#input_game_chat').on("keypress", function(event) {
    if (event.keyCode === 13){
      $('#button_game_send').trigger('click');
    }
  });

  $('#input_main_chat').on("keypress", function(event) {
    if (event.keyCode === 13){
      $('#button_main_send').trigger('click');
    }
  });

  $('#button_main_join').click(function(){
    $('#button_join_join').prop('disabled', true);
  });

  var selectedPlayer;

  $('#list_join_clients').on('change', function() {
    selectedPlayer = this.value;
    if(this.value) {
      $('#button_join_join').prop('disabled', false);
    }
    else {
      $('#button_join_join').prop('disabled', true);
    }
  });

  $('#button_join_join').click(function() {
    FE.joinClient(selectedPlayer);
    $('#main_connected').hide();
    $('#screen_game').show();
    $('body').toggleClass("background-color");
  });

  $('#button_join_refresh').click(function(){
    FE.joinRefresh();
  });

  $('#button_join_back').click(function(){
    FE.mainMenu();
    $('#button_main_join').prop('disabled', false);
    $('#button_main_bot').prop('disabled', false);
    $('#button_main_host').children().first().text('Host');
  });

  $('#modal_chat_init_button').click(function() {
    $(this).css('color', 'white');
    $(this).css('background-color', 'blue');
  });

});


var PAINTER = (function () {

  var currentUser = function (name) {
    return $('#set_name').val() === name;
  }

  var getSafeString = function (s) {
      var lt = /</g,
      gt = />/g,
      ap = /'/g,
      ic = /"/g;
      return s.replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");
  }

  var scrollToBottom = function (id) {
      $(id).scrollTop($(id)[0].scrollHeight)
  }

  var addChatMessage = function (id, name, message) {
    var post = "";
    if (name) {
      if(currentUser(name)) {
        post += "<p class=\"chat-ballon-left\">"+getSafeString(message)+"</p>";
        post += "<p class=\"chat-author-left\">"+getSafeString(name)+"</p>";
      }
      else {
        post += "<p class=\"chat-ballon-right\">"+getSafeString(message)+"</p>";
        post += "<p class=\"chat-author-right\">"+getSafeString(name)+"</p>";
      }
    }
    else {
      post = "<p class=\"chat-ballon\">" + getSafeString(message) + "</p>"
    }
    $(id).append(post).show('slow');
  }

  return {
    repaintClientsLists: function (clientList) {
      $('#list_join_clients').find('option').remove();
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].state == "hosting") {
          $('#list_join_clients').append($("<option></option>")
                                  .attr("value",clientList[i].id)
                                  .text(getSafeString(clientList[i].name)));
        }
      }

      $('#table_main_players').find("tr").remove();
      for (var i = 0; i < clientList.length; i++) {
        $('#table_main_players').append(
          '<tr>' +
            '<td>(' + (i+1) + ')</td>' +
            '<td>' + getSafeString(clientList[i].name) + '</td>' +
            '<td>['+ clientList[i].state +']</td>' +
          '</tr>'
        );
      }
    },
    enableConnection: function() {
      $('#button_main_ok').removeClass("disabled");
    },
    setPlayerName: function() {
      var name = $('#input_name').val();
      $('#screen_main').hide();
      $('#main_connected').show();
      $('#set_name').val(name);
      $('#name_display').text(' '+name);
    },
    displayErrorMessage: function(reason) {
      $("#error_login").text(reason);
    },
    printMessage: function(name, message) {

      if ($('#screen_game:visible').length) {
        addChatMessage("#game_chat_container", name, message);
        scrollToBottom("#game_chat_container");
        if (!currentUser(name)) {
          $('#modal_chat_init_button').css('color', 'red');
          $('#modal_chat_init_button').css('background-color', 'whitesmoke');
        }
      }
      addChatMessage("#main_chat_container", name, message);
      scrollToBottom("#main_chat_container");

    },
    startGame: function() {
      $('#main_connected').hide();
      $('#screen_game').show();
    },
    endGame: function(message) {
      $('#victory_message').text(message);
      $('#modal_victory').modal({backdrop: 'static', keyboard: false});
    },
    playSoundChecked: function() {
        return $('#checkbox_main_playsound').find('span').hasClass("glyphicon-volume-up");
    }

  }
}());

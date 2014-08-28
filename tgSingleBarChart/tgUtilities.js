//-------------------------------
// This is a holding area for various utilities
//-------------------------------

var tgUtilities = (function() {

  function resolveMemberImpl(object, path, defaultValue) {
    var value = null;
    if(typeof defaultValue === 'undefined') {
      defaultValue = null;
    }
    if(typeof object !== 'undefined' && object !== null){
      if(typeof path === 'undefined' || path === null) {
        value = object;
      }
      else {
        var members = path.split('.');
        for(var i = 0; i < members.length; i++){
          object = object[members[i]];
          if(typeof object === 'undefined' || object === null) {
            value = defaultValue;
            break;
          }
          else if(i === (members.length - 1)){
            // if we are on te last one get the value
            value = object;
          }
        }
      }
    }
    return value;
  }

  return {
    resolveMember: function(object, path, defaultValue){
      return resolveMemberImpl(object, path, defaultValue);
    }
  };
})();
window.tgUtilities = tgUtilities;
function validateInput() {
    var input = document.querySelector('#nickname').value;
    if (input == "") {
        var c = document.querySelector('#form_div').className;
        return false;
    } else
        return true;
}

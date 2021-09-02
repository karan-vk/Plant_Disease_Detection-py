$(document).ready(function () {

	function readURL(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();

			reader.onload = function (e) {
				$('#selected_image')
					.attr('src', e.target.result)
					.width(176)
					.height(176);
			}
			reader.readAsDataURL(input.files[0]);
		}
	}

	$('#imagefile').change(function () {
		readURL(this);
	});


	$("form#analysis-form").submit(function (event) {
		event.preventDefault();

		var analyze_button = $("button#analyze-button");
		var imagefile = $('#imagefile')[0].files;

		if (!imagefile.length > 0) {
			alert("Please select a file to analyze!");
		}
		else {
			analyze_button.html("Analyzing..");
			analyze_button.prop("disabled", "true");

			var fd = new FormData();
			fd.append('file', imagefile[0]);

			var loc = window.location;

			$.ajax({
				method: 'POST',
				async: true,
				url: loc.protocol + '//' + loc.hostname + ':' + loc.port + '/analyze',
				data: fd,
				processData: false,
				contentType: false,
			}).done(function (data) {
				console.log("Done Request!");
	
				if (data.result== "Potato___Late_blight") {
					$("#result").html("This Leaf is from a Potato Plant and it have high chances of having Late Blight");
				} 
				else if (data.result== "Potato___healthy") {
					$("#result").html("This Leaf is from a Potato Plant and it is Healthy");
				}
				else if (data.result== "Potato___Early_blight") {
					$("#result").html("This Leaf is from a Potato Plant and it have high chances of having Early Blight");
				}
				else if (data.result== "Apple_scab") {
					$("#result").html("This Leaf is from an Apple Plant and it have high chances of having Scab");
				}
				else if (data.result== "Apple_healthy") {
					$("#result").html("This Leaf is from an Apple Plant and it is Healthy");
				}
				else if (data.result== "black_rot") {
					$("#result").html("This Leaf is from an Apple Plant and it have high chances of having Black Rot");
				}
				else if (data.result== "Cedar_apple_rust") {
					$("#result").html("This Leaf is from an Apple Plant and it have high chances of having Cedar Apple Rust");
				}
				else if (data.result== "Blueberry_healthy") {
					$("#result").html("This Leaf is from a Blueberry Plant and it is Healthy");
				}
				else if (data.result== "Cherry_(including_sour)_Powdery_mildew") {
					$("#result").html("This Leaf is from a Cherry Plant and it have high chances of having Powdery Mild");
				}
				else if (data.result== "Cherry_(including_sour)_healthy") {
					$("#result").html("This Leaf is from a Cherry Plant and it is Healthy");
				}
				else if (data.result== "Corn_(maize)_Cercospora_leaf_spot Gray_leaf_spot") {
					$("#result").html("This Leaf is from a Corn Plant and it have high chances of having Grey Leaf Spot");
				}
				else if (data.result== "Corn_(maize)_Common_rust_") {
					$("#result").html("This Leaf is from a Corn Plant and it have high chances of having Common Rust");
				}
				else if (data.result== "Corn_(maize)_Northern_Leaf_Blight") {
					$("#result").html("This Leaf is from a Corn Plant and it have high chances of having Northern Leaf Blight");
				}
				else if (data.result== "Corn_(maize)_healthy") {
					$("#result").html("This Leaf is from a Corn Plant and it is Healthy");
				}
				else if (data.result== "Grape_Black_rot") {
					$("#result").html("This Leaf is from a Grape Plant and it have high chances of having Black Rot");
				}
				else{
					$("#result").html(`This Leaf is from a ${data.result.split("_")[0]} and it have high chances of having ${`${data.result.split("_").slice(1,5)}`.replace(","," ")}`);
				}

			}).fail(function (e) {
				console.log("Fail Request!");
				console.log(e);
			});
		};

		analyze_button.prop("disabled", "");
		analyze_button.html("Analyze");
		console.log("Submitted!");
	});
});
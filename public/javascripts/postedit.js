let postEditForm = document.getElementById('postEditForm')
	postEditForm.addEventListener('submit', function (event) {
		let imageUpload = document.getElementById('imageUpload').files.length
		let existImages = document.querySelectorAll('.imageDelete').length
		let imageDelete = document.querySelectorAll('.imageDelete:checked').length
		newTotal = existImages - imageDelete + imageUpload
		if (newTotal > 4) {
			event.preventDefault();
			alert(`You need to remove atleast ${newTotal-4} images`)
		}

	})

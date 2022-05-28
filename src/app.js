const dict = {
	java: 10,
	php: 5,
	'c++': 10,
	python: 25,
	senior: 30,
	bachelor: 20,
	chinese: 50,
	english: 20
}

const fileList = {}

$(document).ready(function () {
	var inputs = document.querySelectorAll('.inputfile');
	Array.prototype.forEach.call( inputs, function( input )
	{
		var label	 = input.nextElementSibling,
			labelVal = label.innerHTML;

		input.addEventListener( 'change', function( e )
		{
			var fileName = '';
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName ){
				label.querySelector('span').innerHTML = fileName;
				

			

				for (let i = 0; i < this.files.length; i++) {

					let reader = new FileReader();
					reader.onload = function () {
					let dataURL = reader.result;
					$("#selected-image").attr("src", dataURL);
					$("#selected-image").addClass("col-12");
				}
					

					let file = this.files[i];
					fileList[file.name]=0
					reader.readAsDataURL(file);
					startRecognize(file);				

				}

			}
			else{
				label.innerHTML = labelVal;
				$("#selected-image").attr("src", '');
				$("#selected-image").removeClass("col-12");
				$("#arrow-right").addClass("fa-arrow-right");
				$("#arrow-right").removeClass("fa-check");
				$("#arrow-right").removeClass("fa-spinner fa-spin");
				$("#arrow-down").addClass("fa-arrow-down");
				$("#arrow-down").removeClass("fa-check");
				$("#arrow-down").removeClass("fa-spinner fa-spin");
				$("#log").empty();
			}
		});

		// Firefox bug fix
		input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
	})
});

$("#startLink").click(function () {
	var img = document.getElementById('selected-image');
	startRecognize(img);
});

function startRecognize(img){
	$("#arrow-right").removeClass("fa-arrow-right");
	$("#arrow-right").addClass("fa-spinner fa-spin");
	$("#arrow-down").removeClass("fa-arrow-down");
	$("#arrow-down").addClass("fa-spinner fa-spin");
	recognizeFile(img);
	
}

function progressUpdate(packet, nameFile){
	var log = document.getElementById('log');

	if(log.firstChild && log.firstChild.status === packet.status){
		if('progress' in packet){
			var progress = log.firstChild.querySelector('progress')
			progress.value = packet.progress
		}
	}else{
		var line = document.createElement('div');
		line.status = packet.status;
		var status = document.createElement('div')
		status.className = 'status'
		status.appendChild(document.createTextNode(packet.status))
		line.appendChild(status)

		if('progress' in packet){
			var progress = document.createElement('progress')
			progress.value = packet.progress
			progress.max = 1
			line.appendChild(progress)
		}


		if(packet.status == 'done'){
			log.innerHTML = ''
			var cvContent = packet.data.text.replace(/\n\s*\n/g, '\n')

            //DO SOMETHING HERE//////////////////
			updatePoint(cvContent, nameFile)
            ///////////////////////////////////////////
			var pre = document.createElement('pre')
			pre.appendChild(document.createTextNode(cvContent))
			

			var res = showResult()
			
			line.innerHTML = ''

			line.setAttribute("class","flex-column")
			pre.setAttribute("class", "p-2")
			res.setAttribute("class","p-2")



			line.appendChild(res)
            line.appendChild(pre)
			$(".fas").removeClass('fa-spinner fa-spin')
			$(".fas").addClass('fa-check')
			console.log(line)
		}

		log.insertBefore(line, log.firstChild)

	}
}

function recognizeFile(file){
	$("#log").empty();
  	const corePath = window.navigator.userAgent.indexOf("Edge") > -1
    ? 'src/tesseract-core.asm.js'
    : 'src/tesseract-core.wasm.js';


	const worker = new Tesseract.TesseractWorker({
		corePath,
	});

	worker.recognize(file,
		$("#langsel").val()
	)
		.progress(function(packet){
			console.info(packet)
			progressUpdate(packet, file.name)

		})
		.then(function(data){
			console.log(data)
			progressUpdate({ status: 'done', data: data }, file.name)
		})
	
}

///////////////////////CUSTOM/////////////////////////
function calculatePoint(cvContent) {
	let sumPoint=0
	for (var key in dict) {
		if (cvContent.includes(key)) {
			sumPoint+=dict[key]
		}
	}
	return sumPoint
}

function updatePoint(cvContent, nameFile) {
	cvContent = cvContent.toLowerCase()
	let sumPoint = calculatePoint(cvContent)
	fileList[nameFile] = sumPoint
	
}

function showResult() {


	let fileAndPoint = [];
	for (var file in fileList) {
		fileAndPoint.push([file, fileList[file]]);
	}
	
	fileAndPoint.sort(function(a, b) {
		return b[1] - a[1];
	});

	var res = document.createElement('div')
	let i = 1
	for (const file of fileAndPoint) {
		var item = document.createElement('div')
		item.appendChild(document.createTextNode(i.toString()+'/ '+file[0].toString()+' Point: '+file[1].toString()))
		res.appendChild(item)
		i+=1
	}

	return res
}
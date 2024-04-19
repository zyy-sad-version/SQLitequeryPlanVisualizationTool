let queryConditionStr;

function setCondition(str){
  queryConditionStr = str;

}
let hasInnerJoinCondition = false;
function setHasInnerJoinCondition(b){
  hasInnerJoinCondition = b;
}

function getAnimation(){
  let firstFlag = -1;
  let secondFlag = 0.2;
  const myCanvas = document.getElementById("mycanvas");
  if(myCanvas){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        myCanvas.clientWidth / myCanvas.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({canvas: myCanvas});
    renderer.setSize(myCanvas.clientWidth, myCanvas.clientHeight);
    const data = [["sdtudentID", 'name', 'number'], ['0', 'Alex', '010101'], ['1', 'Sam', '1212']];
    const sqlQuery = "select * from table1 inner join table2 on table1.name = table2.name";

// Create circle1
    const geometry1 = new THREE.CircleGeometry(0.7, 32);
    const material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide,transparent:true,opacity:0.5 });
    const circleMesh1 = new THREE.Mesh(geometry1, material1);
    circleMesh1.position.set(-4,0,0);
    const geometry2 = new THREE.CircleGeometry(0.7, 32);
    const material2 = new THREE.MeshBasicMaterial({ color: 0xFF69B4, side: THREE.DoubleSide ,transparent:true,opacity:0.5});
    const circleMesh2 = new THREE.Mesh(geometry2, material2);
    circleMesh2.position.set(4, 0, 0); //


    if(!hasInnerJoinCondition){
      firstFlag =-0.7;
      secondFlag = 0.7
    }


      scene.add(circleMesh1);
      scene.add(circleMesh2);

      // add annotation condition
      const loader = new THREE.FontLoader();
      loader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textGeometry = new THREE.TextGeometry(queryConditionStr, {
          font: font,
          size: 0.1,
          curveSegments: 24,
          height: 0.02
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-1.5, 0, 0);
        scene.add(textMesh);
      });

    let frame = 1;

    function animate() {
      requestAnimationFrame(animate);

      if(frame> 500){
        circleMesh1.material.color.set(0xD2691E);
        circleMesh2.material.color.set(0xD2691E);
        circleMesh1.material.opacity = 1;
        circleMesh2.material.opacity = 1;

      }else
      {
        if(circleMesh1.position.x <firstFlag){
          circleMesh1.position.x +=0.02;
        }


        if(circleMesh2.position.x> secondFlag){
          circleMesh2.position.x-= 0.02;
        } else{

          if(frame%60 >30){
            circleMesh1.material.color.set(0xD2691E);
            circleMesh2.material.color.set(0xD2691E);
            circleMesh1.material.opacity = 1;
            circleMesh2.material.opacity = 1;

          }else{
            circleMesh1.material.color.set(0x00ff00);
            circleMesh2.material.color.set(0xFF69B4);
            circleMesh1.material.opacity = 0.5;
            circleMesh2.material.opacity = 0.5;
          }
        }
        frame++;
      }



      renderer.render(scene, camera);
    }
    animate();

  }

}

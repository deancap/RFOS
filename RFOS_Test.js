function testWorkflow(){

  let stage = "Survey";

  while(stage){

    Logger.log(stage);

    stage = nextStage(stage);

  }

}
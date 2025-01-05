import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case.js";
import { ReadImagesUseCase } from "./read-images.use-case.js";
import { RecogniseImagesUseCase } from "./recognise-images.use-case.js";
import { TransformImagesUseCase } from "./transform-images.use-case.js";
export class ProcessImagesUseCase {
    inputImagesDir;
    outputImagesDir;
    readImagesUseCase;
    recogniseImagesUseCase;
    createImagesInDbUseCase;
    transformImagesUseCase;
    constructor(inputImagesDir, outputImagesDir) {
        this.inputImagesDir = inputImagesDir;
        this.outputImagesDir = outputImagesDir;
        this.readImagesUseCase = new ReadImagesUseCase(this.inputImagesDir);
        this.recogniseImagesUseCase = new RecogniseImagesUseCase();
        this.createImagesInDbUseCase = new CreateImagesInDbUseCase();
        this.transformImagesUseCase = new TransformImagesUseCase(this.outputImagesDir);
    }
    async execute() {
        const imagesPaths = await this.readImagesUseCase.execute();
        const images = await this.createImagesInDbUseCase.execute(imagesPaths);
        console.log('### images', images);
        this.recogniseImagesUseCase.execute(images);
        this.transformImagesUseCase.execute({
            images,
            watermarkText: 'Albert Montolio'
        });
    }
}
//# sourceMappingURL=process-images.use-case.js.map
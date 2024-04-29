import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileResourceService } from './file-resource.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'shared/guards/auth.guard';
import { User } from 'shared/decorators/user.decorator';
import { UserDecoratorType } from 'shared/types/user/user.type';
import { UploadFileDto } from './dto/upload-file.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateFileResourceRouteSwaggerDescription } from './swagger/createFileResource.swagger';

@ApiTags('file-resourses controller')
@Controller('file-resourse')
export class FileResourseController {
  constructor(private readonly fileResourseService: FileResourceService) {}

  @UseGuards(AuthGuard)
  @Post('/upload')
  @CreateFileResourceRouteSwaggerDescription()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @User() user: UserDecoratorType,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 500000,
          message: 'Pics size must have <= 500000 kb (0,5 MB)',
        })
        .addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() uploadfileDto: UploadFileDto,
  ) {
    return this.fileResourseService.upload({
      userId: user.userId,
      file,
      imageType: uploadfileDto.type,
    });
  }
}

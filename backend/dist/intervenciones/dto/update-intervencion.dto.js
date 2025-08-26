"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIntervencionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_intervencion_dto_1 = require("./create-intervencion.dto");
class UpdateIntervencionDto extends (0, swagger_1.PartialType)(create_intervencion_dto_1.CreateIntervencionDto) {
}
exports.UpdateIntervencionDto = UpdateIntervencionDto;
//# sourceMappingURL=update-intervencion.dto.js.map
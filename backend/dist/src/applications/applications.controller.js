"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const applications_service_1 = require("./applications.service");
const create_application_dto_1 = require("./dto/create-application.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ApplicationsController = class ApplicationsController {
    applicationsService;
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    create(createApplicationDto, req) {
        if (req.user.role !== 'CANDIDATE') {
            throw new common_1.ForbiddenException('Only candidates can apply to jobs');
        }
        return this.applicationsService.create(createApplicationDto, req.user.userId);
    }
    findAllForCandidate(req) {
        if (req.user.role !== 'CANDIDATE') {
            throw new common_1.ForbiddenException('Only candidates can view their applications');
        }
        return this.applicationsService.findAllForCandidate(req.user.userId);
    }
    findAllForJob(jobId, req) {
        if (req.user.role !== 'EMPLOYER' && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only employers can view job applications');
        }
        return this.applicationsService.findAllForJob(jobId, req.user.userId);
    }
    acceptApplication(id, req) {
        if (req.user.role !== 'EMPLOYER') {
            throw new common_1.ForbiddenException('Only employers can accept applications');
        }
        return this.applicationsService.acceptApplication(id, req.user.userId);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_application_dto_1.CreateApplicationDto, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-applications'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "findAllForCandidate", null);
__decorate([
    (0, common_1.Get)('job/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "findAllForJob", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "acceptApplication", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.Controller)('applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map
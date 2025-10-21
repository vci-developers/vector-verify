# 🎯 EXTREME REFACTOR PLAN: Hexagonal Architecture + DDD

## 🏗️ **NEW ARCHITECTURE: "Ports & Adapters" + Domain-Driven Design**

### **Philosophy:**

- **Domain-First**: Business logic drives everything
- **Dependency Inversion**: Core doesn't depend on external concerns
- **Testability**: 100% unit testable business logic
- **Consistency**: Every feature follows identical patterns
- **Future-Proof**: Easy to swap implementations (REST → GraphQL, etc.)

---

## 📁 **COMPLETE NEW STRUCTURE**

```
src/
├── app/                                 # Next.js App Router (Framework Layer)
│   ├── (routes)/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   └── api/
│   ├── layout.tsx
│   └── providers.tsx
│
├── domains/                             # 🎯 DOMAIN LAYER (Core Business Logic)
│   ├── annotation/
│   │   ├── entities/                   # Pure domain objects
│   │   │   ├── annotation.entity.ts
│   │   │   ├── annotation-task.entity.ts
│   │   │   └── annotation-progress.entity.ts
│   │   ├── value-objects/              # Immutable value types
│   │   │   ├── species.vo.ts
│   │   │   ├── annotation-status.vo.ts
│   │   │   └── morph-id.vo.ts
│   │   ├── repositories/               # Repository interfaces (ports)
│   │   │   ├── annotation.repository.ts
│   │   │   └── annotation-task.repository.ts
│   │   ├── services/                   # Domain services
│   │   │   ├── annotation-validation.service.ts
│   │   │   └── species-classification.service.ts
│   │   ├── events/                     # Domain events
│   │   │   ├── annotation-submitted.event.ts
│   │   │   └── task-completed.event.ts
│   │   └── errors/                     # Domain-specific errors
│   │       ├── invalid-species.error.ts
│   │       └── annotation-not-found.error.ts
│   │
│   ├── review/                         # Review domain
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/
│   │   └── services/
│   │
│   ├── user/                           # User domain
│   └── shared/                         # Shared domain concepts
│       ├── value-objects/
│       │   ├── id.vo.ts
│       │   ├── email.vo.ts
│       │   └── date-range.vo.ts
│       └── errors/
│           └── domain.error.ts
│
├── application/                         # 🎯 APPLICATION LAYER (Use Cases)
│   ├── annotation/
│   │   ├── use-cases/                  # Application use cases
│   │   │   ├── submit-annotation/
│   │   │   │   ├── submit-annotation.use-case.ts
│   │   │   │   ├── submit-annotation.request.ts
│   │   │   │   └── submit-annotation.response.ts
│   │   │   ├── get-annotation-tasks/
│   │   │   ├── get-task-progress/
│   │   │   └── update-annotation/
│   │   ├── queries/                    # Read-side queries
│   │   │   ├── get-annotation-tasks.query.ts
│   │   │   └── get-task-annotations.query.ts
│   │   ├── commands/                   # Write-side commands
│   │   │   ├── create-annotation-task.command.ts
│   │   │   └── submit-annotation.command.ts
│   │   └── handlers/                   # Command/Query handlers
│   │       ├── submit-annotation.handler.ts
│   │       └── get-annotation-tasks.handler.ts
│   │
│   └── shared/
│       ├── interfaces/
│       │   ├── use-case.interface.ts
│       │   ├── query.interface.ts
│       │   └── command.interface.ts
│       └── types/
│           ├── pagination.types.ts
│           └── result.types.ts
│
├── infrastructure/                      # 🎯 INFRASTRUCTURE LAYER (Adapters)
│   ├── http/                           # HTTP adapters
│   │   ├── clients/
│   │   │   ├── annotation.client.ts
│   │   │   └── review.client.ts
│   │   ├── mappers/                    # DTO ↔ Domain mapping
│   │   │   ├── annotation.mapper.ts
│   │   │   └── annotation-task.mapper.ts
│   │   └── repositories/               # Repository implementations
│   │       ├── http-annotation.repository.ts
│   │       └── http-annotation-task.repository.ts
│   │
│   ├── persistence/                    # Data persistence adapters
│   │   ├── repositories/
│   │   └── entities/                   # Database entities (if needed)
│   │
│   ├── events/                         # Event infrastructure
│   │   ├── event-bus.ts
│   │   └── handlers/
│   │
│   └── external/                       # External service adapters
│       ├── image-processing/
│       └── notifications/
│
├── presentation/                        # 🎯 PRESENTATION LAYER (UI)
│   ├── components/                     # React components
│   │   ├── ui/                        # Pure UI components
│   │   ├── forms/                     # Form components
│   │   ├── layouts/                   # Layout components
│   │   └── features/                  # Feature-specific components
│   │       ├── annotation/
│   │       │   ├── task-list/
│   │       │   ├── task-detail/
│   │       │   └── annotation-form/
│   │       └── review/
│   │
│   ├── hooks/                          # React hooks (adapters to application layer)
│   │   ├── annotation/
│   │   │   ├── use-submit-annotation.hook.ts
│   │   │   ├── use-annotation-tasks.hook.ts
│   │   │   └── use-task-progress.hook.ts
│   │   └── shared/
│   │       ├── use-pagination.hook.ts
│   │       └── use-form-validation.hook.ts
│   │
│   ├── providers/                      # React context providers
│   │   ├── annotation.provider.tsx
│   │   ├── theme.provider.tsx
│   │   └── query.provider.tsx
│   │
│   └── utils/                          # Presentation utilities
│       ├── form-validation.utils.ts
│       └── component.utils.ts
│
├── shared/                              # 🎯 SHARED LAYER
│   ├── types/                          # Global types
│   ├── constants/                      # Global constants
│   ├── utils/                          # Pure utility functions
│   ├── config/                         # Configuration
│   └── errors/                         # Global error handling
│
└── tests/                               # 🎯 TESTING
    ├── unit/                           # Unit tests (domain + application)
    ├── integration/                    # Integration tests
    ├── e2e/                           # End-to-end tests
    └── fixtures/                       # Test data
```

---

## 🎯 **CORE PRINCIPLES**

### **1. Dependency Direction (CRITICAL)**

```
Presentation → Application → Domain ← Infrastructure
                ↑                           ↑
                └── Dependency Injection ───┘
```

### **2. Domain-First Development**

- Business logic lives in `domains/`
- Zero dependencies on external concerns
- Pure TypeScript objects
- 100% unit testable

### **3. Use Case Driven**

- Every user interaction = Use Case
- Clear inputs/outputs
- Single responsibility
- Easy to test and modify

### **4. Consistent Patterns**

- Every feature follows identical structure
- Predictable file locations
- Standard naming conventions
- Uniform error handling

---

## 🔥 **EXAMPLE: Submit Annotation Use Case**

### **Domain Entity**

```typescript
// domains/annotation/entities/annotation.entity.ts
export class Annotation {
  constructor(
    private readonly id: AnnotationId,
    private readonly specimenId: SpecimenId,
    private species: Species,
    private sex: Sex,
    private abdomenStatus: AbdomenStatus,
    private notes: Notes,
    private flagged: boolean,
    private status: AnnotationStatus,
  ) {}

  public submit(): void {
    this.validateForSubmission();
    this.status = AnnotationStatus.SUBMITTED;
    // Domain events would be emitted here
  }

  private validateForSubmission(): void {
    if (!this.species.isValid()) {
      throw new InvalidSpeciesError();
    }
    // Other business rules
  }
}
```

### **Use Case**

```typescript
// application/annotation/use-cases/submit-annotation/submit-annotation.use-case.ts
export class SubmitAnnotationUseCase
  implements UseCase<SubmitAnnotationRequest, SubmitAnnotationResponse>
{
  constructor(
    private readonly annotationRepository: AnnotationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    request: SubmitAnnotationRequest,
  ): Promise<Result<SubmitAnnotationResponse>> {
    try {
      // 1. Get annotation
      const annotation = await this.annotationRepository.findById(
        request.annotationId,
      );
      if (!annotation) {
        return Result.failure(new AnnotationNotFoundError());
      }

      // 2. Update annotation data
      annotation.updateSpecies(request.species);
      annotation.updateSex(request.sex);
      annotation.updateNotes(request.notes);

      // 3. Submit (business logic)
      annotation.submit();

      // 4. Save
      await this.annotationRepository.save(annotation);

      // 5. Emit events
      await this.eventBus.publish(new AnnotationSubmittedEvent(annotation));

      return Result.success(new SubmitAnnotationResponse(annotation.getId()));
    } catch (error) {
      return Result.failure(error);
    }
  }
}
```

### **React Hook (Adapter)**

```typescript
// presentation/hooks/annotation/use-submit-annotation.hook.ts
export function useSubmitAnnotation() {
  const submitAnnotationUseCase = useInject(SubmitAnnotationUseCase);

  return useMutation({
    mutationFn: async (request: SubmitAnnotationRequest) => {
      const result = await submitAnnotationUseCase.execute(request);

      if (result.isFailure()) {
        throw result.getError();
      }

      return result.getValue();
    },
    onSuccess: () => {
      showSuccessToast('Annotation submitted successfully');
    },
    onError: error => {
      showErrorToast(error.message);
    },
  });
}
```

### **Component**

```typescript
// presentation/components/features/annotation/annotation-form/annotation-form.component.tsx
export function AnnotationForm({ annotationId }: { annotationId: number }) {
  const { mutate: submitAnnotation, isPending } = useSubmitAnnotation();

  const handleSubmit = (formData: AnnotationFormData) => {
    submitAnnotation({
      annotationId,
      species: formData.species,
      sex: formData.sex,
      notes: formData.notes
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Simple, clean UI logic only */}
    </Form>
  );
}
```

---

## 🎯 **DEPENDENCY INJECTION SETUP**

```typescript
// shared/di/container.ts
export class DIContainer {
  private static instance: DIContainer;
  private services = new Map();

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(token: string, factory: () => T): void {
    this.services.set(token, factory);
  }

  resolve<T>(token: string): T {
    const factory = this.services.get(token);
    if (!factory) {
      throw new Error(`Service not found: ${token}`);
    }
    return factory();
  }
}

// Bootstrap
export function bootstrapDI() {
  const container = DIContainer.getInstance();

  // Register repositories
  container.register(
    'AnnotationRepository',
    () => new HttpAnnotationRepository(httpClient),
  );

  // Register use cases
  container.register(
    'SubmitAnnotationUseCase',
    () =>
      new SubmitAnnotationUseCase(
        container.resolve('AnnotationRepository'),
        container.resolve('EventBus'),
      ),
  );
}
```

---

## 🚀 **BENEFITS OF THIS EXTREME REFACTOR**

### **1. 100% Testable**

```typescript
// Test domain logic in isolation
describe('Annotation Entity', () => {
  it('should throw error when submitting invalid species', () => {
    const annotation = new Annotation(/* ... */);
    annotation.updateSpecies(Species.invalid());

    expect(() => annotation.submit()).toThrow(InvalidSpeciesError);
  });
});

// Test use cases with mocks
describe('SubmitAnnotationUseCase', () => {
  it('should save annotation when valid', async () => {
    const mockRepo = mock<AnnotationRepository>();
    const useCase = new SubmitAnnotationUseCase(mockRepo, mockEventBus);

    const result = await useCase.execute(validRequest);

    expect(result.isSuccess()).toBe(true);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

### **2. Future-Proof**

- Want to switch from REST to GraphQL? Just change infrastructure layer
- Want to add caching? Decorator pattern on repositories
- Want real-time updates? Add event sourcing

### **3. Consistent Patterns**

- Every feature has identical structure
- New developers know exactly where to find things
- Easy to add new features following same patterns

### **4. Business Logic Protection**

- Core business rules can't be accidentally broken
- Domain logic is framework-agnostic
- Easy to migrate to different technologies

---

## 📋 **MIGRATION PLAN**

### **Phase 1: Setup Foundation (Week 1)**

1. Create new folder structure
2. Setup dependency injection
3. Create base interfaces and types
4. Setup testing infrastructure

### **Phase 2: Migrate Annotation Domain (Week 2)**

1. Extract annotation business logic into domain entities
2. Create annotation use cases
3. Implement HTTP adapters
4. Create React hooks adapters

### **Phase 3: Migrate Components (Week 3)**

1. Refactor annotation components to use new hooks
2. Remove business logic from components
3. Add proper error handling

### **Phase 4: Migrate Other Features (Week 4+)**

1. Apply same patterns to review feature
2. Apply same patterns to user management
3. Apply same patterns to new features

---

## 🎯 **RESULT: BULLETPROOF ARCHITECTURE**

After this refactor, you'll have:

- ✅ **100% testable business logic**
- ✅ **Framework-agnostic core**
- ✅ **Consistent patterns across all features**
- ✅ **Easy to onboard new developers**
- ✅ **Future-proof and scalable**
- ✅ **Clean separation of concerns**
- ✅ **Professional enterprise-grade structure**

This is an **extreme refactor**, but it will give you a **rock-solid
foundation** that you can confidently use for all future features!

Ready to start? I can begin implementing the foundation layer by layer.
